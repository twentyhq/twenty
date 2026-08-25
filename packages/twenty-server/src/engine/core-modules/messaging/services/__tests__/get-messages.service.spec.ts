import { CoreObjectNameSingular } from 'twenty-shared/types';

import { GetMessagesService } from 'src/engine/core-modules/messaging/services/get-messages.service';

describe('GetMessagesService', () => {
  const workspaceMemberId = 'workspace-member-id';
  const workspaceId = 'workspace-id';
  const recordId = 'record-id';

  const setup = (personIds: string[] = []) => {
    const timelineMessagingService = {
      getAndCountMessageThreads: jest.fn().mockResolvedValue({
        messageThreads: [],
        totalNumberOfThreads: 0,
      }),
      getThreadParticipantsByThreadId: jest.fn().mockResolvedValue({}),
      getThreadVisibilityByThreadId: jest.fn().mockResolvedValue({}),
    };
    const relatedPersonIdsService = {
      getRelatedPersonIds: jest.fn().mockResolvedValue(personIds),
    };
    const service = new GetMessagesService(
      timelineMessagingService as never,
      relatedPersonIdsService as never,
    );

    return { service, timelineMessagingService, relatedPersonIdsService };
  };

  it('reads a standard object from its target relation even without related people', async () => {
    const { service, timelineMessagingService } = setup();

    await service.getMessagesFromObjectRecord(
      workspaceMemberId,
      CoreObjectNameSingular.Company,
      recordId,
      workspaceId,
    );

    expect(
      timelineMessagingService.getAndCountMessageThreads,
    ).toHaveBeenCalledWith([], workspaceId, 0, 20, {
      fieldName: 'targetCompanyId',
      recordId,
    });
  });

  it('keeps custom objects on the existing related-person fallback', async () => {
    const { service, timelineMessagingService } = setup();

    await expect(
      service.getMessagesFromObjectRecord(
        workspaceMemberId,
        'pet',
        recordId,
        workspaceId,
      ),
    ).resolves.toEqual({
      totalNumberOfThreads: 0,
      timelineThreads: [],
      relatedPersonIds: [],
    });

    expect(
      timelineMessagingService.getAndCountMessageThreads,
    ).not.toHaveBeenCalled();
  });
});
