import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';
import { type TimelineMessagingService } from 'src/engine/core-modules/messaging/services/timeline-messaging.service';
import { type RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { type MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { type TimelineRecordAccessService } from 'src/engine/core-modules/target/services/timeline-record-access.service';

const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';
const COMPANY_ID = 'company-id';
const PERSON_ID = 'person-id';

const setup = ({
  canReadRecordTimeline,
}: {
  canReadRecordTimeline: boolean;
}) => {
  const timelineMessagingService = {
    getAndCountMessageThreads: jest
      .fn()
      .mockResolvedValue({ messageThreads: [], totalNumberOfThreads: 0 }),
    getThreadParticipantsByThreadId: jest.fn().mockResolvedValue({}),
    getThreadVisibilityByThreadId: jest.fn().mockResolvedValue({}),
  };
  const relatedPersonIdsService = {
    getRelatedPersonIds: jest.fn().mockResolvedValue([PERSON_ID]),
  };
  const messageCalendarTargetReadinessService = {
    resolveTargetFilter: jest.fn().mockResolvedValue(undefined),
  };
  const timelineRecordAccessService = {
    canReadRecordTimeline: jest.fn().mockResolvedValue(canReadRecordTimeline),
  };

  const service = new GetMessagesService(
    timelineMessagingService as unknown as TimelineMessagingService,
    relatedPersonIdsService as unknown as RelatedPersonIdsService,
    messageCalendarTargetReadinessService as unknown as MessageCalendarTargetReadinessService,
    timelineRecordAccessService as unknown as TimelineRecordAccessService,
  );

  return {
    service,
    timelineMessagingService,
    relatedPersonIdsService,
    timelineRecordAccessService,
  };
};

describe('GetMessagesService', () => {
  it('should check record, thread and message read access for the caller', async () => {
    const { service, timelineRecordAccessService } = setup({
      canReadRecordTimeline: true,
    });

    await service.getMessagesFromObjectRecord(
      WORKSPACE_MEMBER_ID,
      'company',
      COMPANY_ID,
      WORKSPACE_ID,
    );

    expect(
      timelineRecordAccessService.canReadRecordTimeline,
    ).toHaveBeenCalledWith({
      objectNameSingular: 'company',
      recordId: COMPANY_ID,
      timelineObjectNamesSingular: ['messageThread', 'message'],
    });
  });

  it('should return an empty timeline without reading threads when access is denied', async () => {
    const { service, timelineMessagingService, relatedPersonIdsService } =
      setup({ canReadRecordTimeline: false });

    const result = await service.getMessagesFromObjectRecord(
      WORKSPACE_MEMBER_ID,
      'company',
      COMPANY_ID,
      WORKSPACE_ID,
    );

    expect(result).toEqual({
      totalNumberOfThreads: 0,
      timelineThreads: [],
      relatedPersonIds: [],
    });
    expect(relatedPersonIdsService.getRelatedPersonIds).not.toHaveBeenCalled();
    expect(
      timelineMessagingService.getAndCountMessageThreads,
    ).not.toHaveBeenCalled();
  });

  it('should build the timeline from related people when access is granted', async () => {
    const { service, timelineMessagingService } = setup({
      canReadRecordTimeline: true,
    });

    const result = await service.getMessagesFromObjectRecord(
      WORKSPACE_MEMBER_ID,
      'company',
      COMPANY_ID,
      WORKSPACE_ID,
    );

    expect(
      timelineMessagingService.getAndCountMessageThreads,
    ).toHaveBeenCalledWith([PERSON_ID], WORKSPACE_ID, 0, 20, undefined);
    expect(result.relatedPersonIds).toEqual([PERSON_ID]);
  });
});
