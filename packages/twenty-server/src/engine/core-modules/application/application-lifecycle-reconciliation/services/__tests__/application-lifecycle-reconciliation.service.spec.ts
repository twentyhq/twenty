import { type Repository } from 'typeorm';

import { ApplicationLifecycleReconciliationService } from 'src/engine/core-modules/application/application-lifecycle-reconciliation/services/application-lifecycle-reconciliation.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

const WORKSPACE_ID = 'workspace-id';

const buildStuckApplication = (
  state: ApplicationState,
  id: string,
): ApplicationEntity =>
  ({
    id,
    universalIdentifier: `universal-identifier-${id}`,
    workspaceId: WORKSPACE_ID,
    state,
  }) as ApplicationEntity;

describe('ApplicationLifecycleReconciliationService', () => {
  let applicationRepository: { find: jest.Mock };
  let applicationService: { transitionState: jest.Mock; delete: jest.Mock };
  let service: ApplicationLifecycleReconciliationService;

  beforeEach(() => {
    applicationRepository = { find: jest.fn().mockResolvedValue([]) };
    applicationService = {
      transitionState: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    service = new ApplicationLifecycleReconciliationService(
      applicationRepository as unknown as Repository<ApplicationEntity>,
      applicationService as unknown as ApplicationService,
    );
  });

  it('removes an install that never completed', async () => {
    applicationRepository.find.mockResolvedValue([
      buildStuckApplication(ApplicationState.INSTALLING, 'stuck-install'),
    ]);

    const reconciledCount = await service.reconcileStuckApplications();

    expect(reconciledCount).toBe(1);
    expect(applicationService.delete).toHaveBeenCalledWith(
      'universal-identifier-stuck-install',
      WORKSPACE_ID,
    );
    expect(applicationService.transitionState).not.toHaveBeenCalled();
  });

  it.each([ApplicationState.UPGRADING, ApplicationState.UNINSTALLING])(
    'returns a stuck %s application to INSTALLED',
    async (state) => {
      applicationRepository.find.mockResolvedValue([
        buildStuckApplication(state, 'stuck'),
      ]);

      await service.reconcileStuckApplications();

      expect(applicationService.transitionState).toHaveBeenCalledWith(
        expect.objectContaining({
          expectedState: state,
          nextState: ApplicationState.INSTALLED,
        }),
      );
      expect(applicationService.delete).not.toHaveBeenCalled();
    },
  );

  it('does not count an application whose operation completed first', async () => {
    applicationRepository.find.mockResolvedValue([
      buildStuckApplication(ApplicationState.UPGRADING, 'settled'),
    ]);
    applicationService.transitionState.mockRejectedValue(
      new Error('another operation is already running'),
    );

    const reconciledCount = await service.reconcileStuckApplications();

    expect(reconciledCount).toBe(0);
  });

  it('reconciles every stuck application in the batch', async () => {
    applicationRepository.find.mockResolvedValue([
      buildStuckApplication(ApplicationState.INSTALLING, 'first'),
      buildStuckApplication(ApplicationState.UPGRADING, 'second'),
    ]);

    const reconciledCount = await service.reconcileStuckApplications();

    expect(reconciledCount).toBe(2);
  });
});
