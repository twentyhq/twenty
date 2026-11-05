import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { BackfillWorkspaceCustomApplicationRegistrationCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-workspace-command-1782853718000-backfill-workspace-custom-application-registration.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-0000000000a1';

describe('BackfillWorkspaceCustomApplicationRegistrationCommand', () => {
  let command: BackfillWorkspaceCustomApplicationRegistrationCommand;
  let workspaceFindOne: jest.Mock;
  let applicationFindOne: jest.Mock;
  let createRegistration: jest.Mock;
  let updateApplication: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    workspaceFindOne = jest.fn();
    applicationFindOne = jest.fn();
    createRegistration = jest.fn().mockResolvedValue({ id: 'registration-1' });
    updateApplication = jest.fn();

    const workspaceRepository = {
      findOne: workspaceFindOne,
    };
    const applicationRepository = {
      findOne: applicationFindOne,
    };
    const applicationService = {
      createWorkspaceCustomApplicationRegistration: createRegistration,
      update: updateApplication,
    };

    const module = await Test.createTestingModule({
      providers: [
        BackfillWorkspaceCustomApplicationRegistrationCommand,
        { provide: WorkspaceIteratorService, useValue: {} },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: workspaceRepository,
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: applicationRepository,
        },
        { provide: ApplicationService, useValue: applicationService },
      ],
    }).compile();
    command = module.get(BackfillWorkspaceCustomApplicationRegistrationCommand);

    jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('creates a registration through ApplicationService and links it to the custom application', async () => {
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

    expect(createRegistration).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      universalIdentifier: CUSTOM_APPLICATION_ID,
    });
    expect(updateApplication).toHaveBeenCalledWith(CUSTOM_APPLICATION_ID, {
      applicationRegistrationId: 'registration-1',
      workspaceId: WORKSPACE_ID,
    });
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

    expect(createRegistration).not.toHaveBeenCalled();
    expect(updateApplication).not.toHaveBeenCalled();
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

    expect(createRegistration).not.toHaveBeenCalled();
    expect(updateApplication).not.toHaveBeenCalled();
  });

  it('skips when the workspace row cannot be found', async () => {
    workspaceFindOne.mockResolvedValue(null);

    await runOnWorkspace();

    expect(applicationFindOne).not.toHaveBeenCalled();
    expect(createRegistration).not.toHaveBeenCalled();
    expect(updateApplication).not.toHaveBeenCalled();
  });

  it('skips when the custom application row cannot be found', async () => {
    workspaceFindOne.mockResolvedValue({
      id: WORKSPACE_ID,
      workspaceCustomApplicationId: CUSTOM_APPLICATION_ID,
    });
    applicationFindOne.mockResolvedValue(null);

    await runOnWorkspace();

    expect(createRegistration).not.toHaveBeenCalled();
    expect(updateApplication).not.toHaveBeenCalled();
  });
});
