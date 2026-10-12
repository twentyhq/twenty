import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RelabelMessageCampaignCountFieldsCommand } from 'src/database/commands/upgrade-version-command/2-47/2-47-workspace-command-1791807747784-relabel-message-campaign-count-fields.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-0000000000aa';

const MESSAGE_CAMPAIGN_FIELDS = STANDARD_OBJECTS.messageCampaign.fields;

describe('RelabelMessageCampaignCountFieldsCommand', () => {
  let command: RelabelMessageCampaignCountFieldsCommand;
  let findMock: jest.Mock;
  let updateMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;

  beforeEach(() => {
    findMock = jest.fn();
    updateMock = jest.fn();
    invalidateCacheMock = jest.fn();

    command = new RelabelMessageCampaignCountFieldsCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
          }),
      } as unknown as ApplicationService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      {
        find: findMock,
        update: updateMock,
      } as unknown as WorkspaceScopedRepository<FieldMetadataEntity>,
    );
  });

  const buildArgs = (dryRun = false) => ({
    workspaceId: WORKSPACE_ID,
    options: { dryRun },
    index: 0,
    total: 1,
  });

  it('relabels the count fields that still carry their count label', async () => {
    findMock.mockResolvedValue([
      {
        id: 'sent-count',
        universalIdentifier:
          MESSAGE_CAMPAIGN_FIELDS.sentCount.universalIdentifier,
        label: 'Sent count',
      },
      {
        id: 'complained-count',
        universalIdentifier:
          MESSAGE_CAMPAIGN_FIELDS.complainedCount.universalIdentifier,
        label: 'Complained count',
      },
      {
        id: 'delivered-count-renamed',
        universalIdentifier:
          MESSAGE_CAMPAIGN_FIELDS.deliveredCount.universalIdentifier,
        label: 'Delivered emails',
      },
      {
        id: 'failed-count-relabelled',
        universalIdentifier:
          MESSAGE_CAMPAIGN_FIELDS.failedCount.universalIdentifier,
        label: 'Failed',
      },
    ]);

    await command.runOnWorkspace(buildArgs());

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'sent-count' },
      { label: 'Sent' },
    );
    expect(updateMock).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'complained-count' },
      { label: 'Complaints' },
    );
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
  });

  it('writes nothing on a dry run', async () => {
    findMock.mockResolvedValue([
      {
        id: 'sent-count',
        universalIdentifier:
          MESSAGE_CAMPAIGN_FIELDS.sentCount.universalIdentifier,
        label: 'Sent count',
      },
    ]);

    await command.runOnWorkspace(buildArgs(true));

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('restores the count labels on down', async () => {
    findMock.mockResolvedValue([
      {
        id: 'sent-count',
        universalIdentifier:
          MESSAGE_CAMPAIGN_FIELDS.sentCount.universalIdentifier,
        label: 'Sent',
      },
      {
        id: 'complained-count',
        universalIdentifier:
          MESSAGE_CAMPAIGN_FIELDS.complainedCount.universalIdentifier,
        label: 'Complaints',
      },
    ]);

    await command.down(buildArgs());

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'sent-count' },
      { label: 'Sent count' },
    );
    expect(updateMock).toHaveBeenCalledWith(
      WORKSPACE_ID,
      { id: 'complained-count' },
      { label: 'Complained count' },
    );
  });
});
