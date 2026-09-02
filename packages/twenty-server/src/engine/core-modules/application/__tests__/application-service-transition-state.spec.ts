import { type Repository } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';
import { type WorkspaceEventBroadcaster } from 'src/engine/subscriptions/workspace-event-broadcaster/workspace-event-broadcaster.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const APPLICATION_ID = 'application-id';
const UNIVERSAL_IDENTIFIER = 'universal-identifier';
const WORKSPACE_ID = 'workspace-id';

describe('ApplicationService - transitionState', () => {
  let applicationRepository: {
    update: jest.Mock;
    findOne: jest.Mock;
  };
  let workspaceCacheService: { invalidateAndRecompute: jest.Mock };
  let workspaceEventBroadcaster: { broadcast: jest.Mock };
  let applicationService: ApplicationService;

  const transitionToUpgrading = () =>
    applicationService.transitionState({
      applicationId: APPLICATION_ID,
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
      expectedState: ApplicationState.INSTALLED,
      nextState: ApplicationState.UPGRADING,
    });

  beforeEach(() => {
    applicationRepository = {
      update: jest.fn(),
      findOne: jest.fn().mockResolvedValue({
        id: APPLICATION_ID,
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
        state: ApplicationState.UPGRADING,
      } as ApplicationEntity),
    };
    workspaceCacheService = {
      invalidateAndRecompute: jest.fn().mockResolvedValue(undefined),
    };
    workspaceEventBroadcaster = {
      broadcast: jest.fn().mockResolvedValue(undefined),
    };

    applicationService = new ApplicationService(
      {} as never,
      applicationRepository as unknown as Repository<ApplicationEntity>,
      {} as never,
      workspaceCacheService as unknown as WorkspaceCacheService,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      workspaceEventBroadcaster as unknown as WorkspaceEventBroadcaster,
    );
  });

  it('flips the state only when the application is in the expected state', async () => {
    applicationRepository.update.mockResolvedValue({ affected: 1 });

    const application = await transitionToUpgrading();

    expect(applicationRepository.update).toHaveBeenCalledWith(
      {
        id: APPLICATION_ID,
        workspaceId: WORKSPACE_ID,
        state: ApplicationState.INSTALLED,
      },
      { state: ApplicationState.UPGRADING },
    );
    expect(application.state).toBe(ApplicationState.UPGRADING);
  });

  it('broadcasts the state change so clients follow the operation', async () => {
    applicationRepository.update.mockResolvedValue({ affected: 1 });

    await transitionToUpgrading();

    expect(workspaceEventBroadcaster.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({
        workspaceId: WORKSPACE_ID,
        events: [
          expect.objectContaining({
            type: 'updated',
            entityName: 'application',
            recordId: APPLICATION_ID,
            properties: expect.objectContaining({
              updatedFields: ['state'],
            }),
          }),
        ],
      }),
    );
  });

  it('rejects the loser of a concurrent flip', async () => {
    applicationRepository.update.mockResolvedValue({ affected: 0 });

    await expect(transitionToUpgrading()).rejects.toThrow(
      expect.objectContaining({
        code: ApplicationExceptionCode.APPLICATION_OPERATION_IN_PROGRESS,
      }) as unknown as ApplicationException,
    );
    expect(workspaceEventBroadcaster.broadcast).not.toHaveBeenCalled();
  });

  it('swallows a lost best-effort transition', async () => {
    applicationRepository.update.mockResolvedValue({ affected: 0 });

    await expect(
      applicationService.transitionStateBestEffort({
        applicationId: APPLICATION_ID,
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        workspaceId: WORKSPACE_ID,
        expectedState: ApplicationState.UPGRADING,
        nextState: ApplicationState.INSTALLED,
      }),
    ).resolves.toBeUndefined();
  });
});
