import { HistoricalImporter } from '../historical-importer';
import type { FirefliesMeetingData, SummaryFetchConfig } from '../types';

const summaryConfig: SummaryFetchConfig = {
  strategy: 'immediate_with_retry',
  retryAttempts: 1,
  retryDelay: 0,
  pollInterval: 0,
  maxPolls: 0,
};

const sampleMeeting: FirefliesMeetingData = {
  id: 'm-1',
  title: 'Sample',
  date: new Date().toISOString(),
  duration: 30,
  participants: [],
  summary: { action_items: [], overview: '' },
  transcript_url: 'https://example.com',
};

describe('HistoricalImporter', () => {
  const buildImporter = () => {
    const firefliesClient = {
      listTranscripts: jest.fn(),
      fetchMeetingDataWithRetry: jest.fn(),
    } as unknown as jest.Mocked<any>;

    const twentyService = {
      findMeetingByFirefliesId: jest.fn(),
      matchParticipantsToContacts: jest.fn(),
      createContactsForUnmatched: jest.fn(),
      createNoteOnly: jest.fn(),
      createMeeting: jest.fn(),
      createNoteTarget: jest.fn(),
    } as unknown as jest.Mocked<any>;

    return { firefliesClient, twentyService };
  };

  it('skips meetings that already exist by firefliesMeetingId', async () => {
    const { firefliesClient, twentyService } = buildImporter();

    firefliesClient.listTranscripts.mockResolvedValue([{ id: 'existing' }]);
    twentyService.findMeetingByFirefliesId.mockResolvedValue({ id: 'twenty-id' });

    const importer = new HistoricalImporter(firefliesClient, twentyService);
    const result = await importer.run(
      {},
      { dryRun: false, autoCreateContacts: true, summaryConfig, plan: 'free' },
    );

    expect(result.skippedExisting).toBe(1);
    expect(result.imported).toBe(0);
    expect(twentyService.createMeeting).not.toHaveBeenCalled();
    expect(result.statuses[0].status).toBe('skipped_existing');
  });

  it('supports dry-run without writing to Twenty', async () => {
    const { firefliesClient, twentyService } = buildImporter();

    firefliesClient.listTranscripts.mockResolvedValue([{ id: 'm-2' }]);
    firefliesClient.fetchMeetingDataWithRetry.mockResolvedValue({
      data: sampleMeeting,
      summaryReady: false,
    });
    twentyService.findMeetingByFirefliesId.mockResolvedValue(undefined);

    const importer = new HistoricalImporter(firefliesClient, twentyService);
    const result = await importer.run(
      {},
      { dryRun: true, autoCreateContacts: false, summaryConfig, plan: 'free' },
    );

    expect(result.imported).toBe(1);
    expect(result.summaryPending).toBe(1);
    expect(twentyService.createMeeting).not.toHaveBeenCalled();
    expect(twentyService.createNoteOnly).not.toHaveBeenCalled();
    expect(result.statuses).toHaveLength(1);
    expect(result.statuses[0].status).toBe('pending_summary');
  });
});


