import { type FirefliesApiClient } from './fireflies-api-client';
import { MeetingFormatter } from './formatters';
import { createLogger } from './logger';
import { type TwentyCrmService } from './twenty-crm-service';
import type {
  FirefliesPlan,
  FirefliesTranscriptListOptions,
  SummaryFetchConfig,
} from './types';

const logger = createLogger('historical-importer');

export type HistoricalImportFilters = FirefliesTranscriptListOptions;

export type HistoricalImportOptions = {
  dryRun?: boolean;
  autoCreateContacts: boolean;
  summaryConfig: SummaryFetchConfig;
  plan: FirefliesPlan;
};

export type HistoricalImportResult = {
  dryRun: boolean;
  totalListed: number;
  imported: number;
  skippedExisting: number;
  failed: Array<{ meetingId: string; reason: string }>;
  summaryPending: number;
  statuses: Array<{
    meetingId: string;
    title?: string;
    status: 'imported' | 'skipped_existing' | 'failed' | 'dry_run' | 'pending_summary';
    reason?: string;
  }>;
};

export class HistoricalImporter {
  private firefliesClient: FirefliesApiClient;
  private twentyService: TwentyCrmService;

  constructor(firefliesClient: FirefliesApiClient, twentyService: TwentyCrmService) {
    this.firefliesClient = firefliesClient;
    this.twentyService = twentyService;
  }

  async run(
    filters: HistoricalImportFilters,
    options: HistoricalImportOptions,
  ): Promise<HistoricalImportResult> {
    const { dryRun = false, autoCreateContacts, summaryConfig, plan } = options;

    logger.info('Listing Fireflies transcripts for historical import...');
    const transcripts = await this.firefliesClient.listTranscripts(filters);
    logger.info(`Found ${transcripts.length} transcript(s) to process`);

    let imported = 0;
    let skippedExisting = 0;
    let summaryPending = 0;
    const failed: Array<{ meetingId: string; reason: string }> = [];
    const statuses: HistoricalImportResult['statuses'] = [];

    for (const transcript of transcripts) {
      const meetingId = transcript.id;

      try {
        const existing = await this.twentyService.findMeetingByFirefliesId(meetingId);
        if (existing) {
          logger.debug(`Skipping ${meetingId}: already exists in Twenty (${existing.id})`);
          skippedExisting += 1;
          statuses.push({
            meetingId,
            title: transcript.title,
            status: 'skipped_existing',
          });
          continue;
        }

        logger.info(`Fetching meeting ${meetingId} details`);
        const { data: meetingData, summaryReady } =
          await this.firefliesClient.fetchMeetingDataWithRetry(
            meetingId,
            summaryConfig,
            plan,
          );

        if (summaryReady === false) {
          summaryPending += 1;
          statuses.push({
            meetingId,
            title: meetingData.title,
            status: 'pending_summary',
          });
        }

        if (dryRun) {
          logger.info(`[dry-run] Would import meeting "${meetingData.title}" (${meetingId})`);
          imported += 1;
          statuses.push({
            meetingId,
            title: meetingData.title,
            status: 'dry_run',
          });
          continue;
        }

        const { matchedContacts, unmatchedParticipants } =
          await this.twentyService.matchParticipantsToContacts(
            meetingData.participants,
          );

        const newContactIds = autoCreateContacts
          ? await this.twentyService.createContactsForUnmatched(unmatchedParticipants)
          : [];
        const allContactIds = [...matchedContacts.map(({ id }) => id), ...newContactIds];

        const noteBody = MeetingFormatter.formatNoteBody(meetingData);
        const noteId = await this.twentyService.createNoteOnly(
          `Meeting: ${meetingData.title}`,
          noteBody,
        );

        const meetingInput = MeetingFormatter.toMeetingCreateInput(meetingData, noteId);
        const createdMeetingId = await this.twentyService.createMeeting(meetingInput);

        for (const contactId of allContactIds) {
          await this.twentyService.createNoteTarget(noteId, contactId);
        }

        logger.info(
          `Imported meeting "${meetingData.title}" (${meetingId}) as ${createdMeetingId}`,
        );
        imported += 1;
        statuses.push({
          meetingId,
          title: meetingData.title,
          status: 'imported',
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        logger.error(`Failed to import meeting ${meetingId}: ${reason}`);
        failed.push({ meetingId, reason });
        statuses.push({
          meetingId,
          title: transcript.title,
          status: 'failed',
          reason,
        });
      }
    }

    return {
      dryRun,
      totalListed: transcripts.length,
      imported,
      skippedExisting,
      failed,
      summaryPending,
      statuses,
    };
  }
}


