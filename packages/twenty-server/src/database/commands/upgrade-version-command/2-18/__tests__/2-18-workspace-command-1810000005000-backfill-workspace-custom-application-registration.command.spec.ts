import { type Repository } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillWorkspaceCustomApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/2-18/2-18-workspace-command-1810000005000-backfill-workspace-custom-application-registration.command';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-0000000000a1';

describe('BackfillWorkspaceCustomApplicationRegistrationCommand', () => {
  let command: BackfillWorkspaceCustomApplicationRegistrationCommand;
  let workspaceFindOne: jest.Mock;
  let applicationFindOne: jest.Mock;
  let applicationUpdate: jest.Mock;
  let registrationCreate: jest.Mock;
  let registrationSave: jest.Mock;
  let invalidateAndRecompute: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    workspaceFindOne = jest.fn();
    applicationFindOne = jest.fn();
    applicationUpdate = jest.fn();
    registrationCreate = jest.fn().mockImplementation((input) => input);
    registrationSave = jest.fn().mockResolvedValue({ id: 'registration-1' });
    invalidateAndRecompute = jest.fn();

    const workspaceRepository = {
      findOne: workspaceFindOne,
    } as unknown as Repository<WorkspaceEntity>;
    const applicationRepository = {
      findOne: applicationFindOne,
      update: applicationUpdate,
    } as unknown as Repository<ApplicationEntity>;
    const applicationRegistrationRepository = {
      create: registrationCreate,
      save: registrationSave,
    } as unknown as Repository<ApplicationRegistrationEntity>;
    const workspaceCacheService = {
      invalidateAndRecompute,
    } as unknown as WorkspaceCacheService;

    command = new BackfillWorkspaceCustomApplicationRegistrationCommand(
      {} as WorkspaceIteratorService,
      workspaceRepository,
      applicationRepository,
      applicationRegistrationRepository,
      workspaceCacheService,
    );

    jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('creates a registration, links it to the custom application and recomputes the cache', async () => {
    workspaceFindOne.mockResolvedValue({
      id: WORKSPACE_ID,
      workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
    });
    applicationFindOne.mockResolvedValue({
      id: CUSTOM_APPLICATION_ID,
      universalIdentifier: CUSTOM_APPLICATION_ID,
      applicationRegistrationId: null,
    });

    await runOnWorkspace();

    expect(registrationCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        universalIdentifier: CUSTOM_APPLICATION_ID,
        ownerWorkspaceId: WORKSPACE_ID,
      }),
    );
    expect(registrationSave).toHaveBeenCalled();
    expect(applicationUpdate).toHaveBeenCalledWith(
      { id: CUSTOM_APPLICATION_ID, workspaceId: WORKSPACE_ID },
      { applicationRegistrationId: 'registration-1' },
    );
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatApplicationMaps',
    ]);
  });

  it('is idempotent: skips when the custom application already has a registration', async () => {
    workspaceFindOne.mockResolvedValue({
      id: WORKSPACE_ID,
      workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
    });
    applicationFindOne.mockResolvedValue({
      id: CUSTOM_APPLICATION_ID,
      universalIdentifier: CUSTOM_APPLICATION_ID,
      applicationRegistrationId: 'existing-registration',
    });

    await runOnWorkspace();

    expect(registrationSave).not.toHaveBeenCalled();
    expect(applicationUpdate).not.toHaveBeenCalled();
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });

  it('does not write anything in dry-run mode', async () => {
    workspaceFindOne.mockResolvedValue({
      id: WORKSPACE_ID,
      workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
    });
    applicationFindOne.mockResolvedValue({
      id: CUSTOM_APPLICATION_ID,
      universalIdentifier: CUSTOM_APPLICATION_ID,
      applicationRegistrationId: null,
    });

    await runOnWorkspace(true);

    expect(registrationSave).not.toHaveBeenCalled();
    expect(applicationUpdate).not.toHaveBeenCalled();
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });

  it('skips when the workspace has no custom application id', async () => {
    workspaceFindOne.mockResolvedValue({
      id: WORKSPACE_ID,
      workspaceCustomApplicationId: null,
    });

    await runOnWorkspace();

    expect(applicationFindOne).not.toHaveBeenCalled();
    expect(registrationSave).not.toHaveBeenCalled();
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });

  it('skips when the custom application row cannot be found', async () => {
    workspaceFindOne.mockResolvedValue({
      id: WORKSPACE_ID,
      workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
    });
    applicationFindOne.mockResolvedValue(null);

    await runOnWorkspace();

    expect(registrationSave).not.toHaveBeenCalled();
    expect(applicationUpdate).not.toHaveBeenCalled();
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });
});
