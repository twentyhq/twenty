import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';
import { type RelatedPersonIdsService } from 'src/engine/core-modules/related-person-ids/services/related-person-ids.service';
import { type MessageCalendarTargetReadinessService } from 'src/engine/core-modules/target/services/message-calendar-target-readiness.service';
import { type TimelineRecordAccessService } from 'src/engine/core-modules/target/services/timeline-record-access.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';
const OPPORTUNITY_ID = 'opportunity-id';

const setup = ({
  canReadRecordTimeline,
}: {
  canReadRecordTimeline: boolean;
}) => {
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(),
  };
  const relatedPersonIdsService = {
    getRelatedPersonIds: jest.fn().mockResolvedValue([]),
  };
  const messageCalendarTargetReadinessService = {
    resolveTargetFilter: jest.fn().mockResolvedValue(undefined),
  };
  const timelineRecordAccessService = {
    canReadRecordTimeline: jest.fn().mockResolvedValue(canReadRecordTimeline),
  };

  const service = new TimelineCalendarEventService(
    workspaceOrmManager as unknown as WorkspaceOrmManager,
    {} as never,
    {} as never,
    {} as never,
    relatedPersonIdsService as unknown as RelatedPersonIdsService,
    {} as never,
    messageCalendarTargetReadinessService as unknown as MessageCalendarTargetReadinessService,
    timelineRecordAccessService as unknown as TimelineRecordAccessService,
  );

  return {
    service,
    workspaceOrmManager,
    relatedPersonIdsService,
    timelineRecordAccessService,
  };
};

const getOpportunityCalendarEvents = (service: TimelineCalendarEventService) =>
  service.getCalendarEventsFromObjectRecord({
    currentWorkspaceMemberId: WORKSPACE_MEMBER_ID,
    objectNameSingular: 'opportunity',
    recordId: OPPORTUNITY_ID,
    workspaceId: WORKSPACE_ID,
    page: 1,
    pageSize: 20,
  });

describe('TimelineCalendarEventService', () => {
  it('should check record and calendar event read access for the caller', async () => {
    const { service, timelineRecordAccessService } = setup({
      canReadRecordTimeline: true,
    });

    await getOpportunityCalendarEvents(service);

    expect(
      timelineRecordAccessService.canReadRecordTimeline,
    ).toHaveBeenCalledWith({
      objectNameSingular: 'opportunity',
      recordId: OPPORTUNITY_ID,
      timelineObjectNamesSingular: ['calendarEvent'],
    });
  });

  it('should return an empty timeline without reading events when access is denied', async () => {
    const { service, workspaceOrmManager, relatedPersonIdsService } = setup({
      canReadRecordTimeline: false,
    });

    const result = await getOpportunityCalendarEvents(service);

    expect(result).toEqual({
      totalNumberOfCalendarEvents: 0,
      timelineCalendarEvents: [],
      relatedPersonIds: [],
    });
    expect(relatedPersonIdsService.getRelatedPersonIds).not.toHaveBeenCalled();
    expect(
      workspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });

  it('should resolve related people when access is granted', async () => {
    const { service, relatedPersonIdsService } = setup({
      canReadRecordTimeline: true,
    });

    await getOpportunityCalendarEvents(service);

    expect(relatedPersonIdsService.getRelatedPersonIds).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      objectNameSingular: 'opportunity',
      recordId: OPPORTUNITY_ID,
    });
  });
});
