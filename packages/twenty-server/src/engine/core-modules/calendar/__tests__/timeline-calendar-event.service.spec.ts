import { CoreObjectNameSingular } from 'twenty-shared/types';

import { TimelineCalendarEventService } from 'src/engine/core-modules/calendar/timeline-calendar-event.service';

describe('TimelineCalendarEventService', () => {
  const currentWorkspaceMemberId = 'workspace-member-id';
  const workspaceId = 'workspace-id';
  const recordId = 'record-id';

  const setup = (personIds: string[] = []) => {
    const relatedPersonIdsService = {
      getRelatedPersonIds: jest.fn().mockResolvedValue(personIds),
    };
    const service = new TimelineCalendarEventService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      relatedPersonIdsService as never,
      {} as never,
    );

    return { service, relatedPersonIdsService };
  };

  it('reads a standard object from its target relation even without related people', async () => {
    const { service } = setup();
    const getCalendarEventsFromPersonIds = jest
      .spyOn(service, 'getCalendarEventsFromPersonIds')
      .mockResolvedValue({
        totalNumberOfCalendarEvents: 0,
        timelineCalendarEvents: [],
        relatedPersonIds: [],
      });

    await service.getCalendarEventsFromObjectRecord({
      currentWorkspaceMemberId,
      objectNameSingular: CoreObjectNameSingular.Opportunity,
      recordId,
      workspaceId,
      page: 1,
      pageSize: 10,
    });

    expect(getCalendarEventsFromPersonIds).toHaveBeenCalledWith({
      currentWorkspaceMemberId,
      personIds: [],
      workspaceId,
      page: 1,
      pageSize: 10,
      targetFilter: {
        fieldName: 'targetOpportunityId',
        recordId,
      },
    });
  });

  it('keeps custom objects on the existing related-person fallback', async () => {
    const { service } = setup();
    const getCalendarEventsFromPersonIds = jest.spyOn(
      service,
      'getCalendarEventsFromPersonIds',
    );

    await expect(
      service.getCalendarEventsFromObjectRecord({
        currentWorkspaceMemberId,
        objectNameSingular: 'pet',
        recordId,
        workspaceId,
        page: 1,
        pageSize: 10,
      }),
    ).resolves.toEqual({
      totalNumberOfCalendarEvents: 0,
      timelineCalendarEvents: [],
      relatedPersonIds: [],
    });

    expect(getCalendarEventsFromPersonIds).not.toHaveBeenCalled();
  });
});
