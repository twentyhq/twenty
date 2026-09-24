import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { RelabelAttachmentTargetFieldsCommand } from 'src/database/commands/upgrade-version-command/2-43/2-43-workspace-command-1790256416822-relabel-attachment-target-fields.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-0000000000aa';
const CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-0000000000cc';

const ATTACHMENT_FIELDS = STANDARD_OBJECTS.attachment.fields;

const buildField = ({
  id,
  label,
  universalIdentifier = id,
  applicationId = STANDARD_APPLICATION_ID,
  relationTargetObjectNameSingular,
}: {
  id: string;
  label: string;
  universalIdentifier?: string;
  applicationId?: string;
  relationTargetObjectNameSingular?: string;
}) => ({
  id,
  label,
  universalIdentifier,
  applicationId,
  relationTargetObjectMetadata: relationTargetObjectNameSingular
    ? { nameSingular: relationTargetObjectNameSingular }
    : null,
});

describe('RelabelAttachmentTargetFieldsCommand', () => {
  let command: RelabelAttachmentTargetFieldsCommand;
  let findMock: jest.Mock;
  let updateMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;

  beforeEach(() => {
    findMock = jest.fn();
    updateMock = jest.fn();
    invalidateCacheMock = jest.fn();

    command = new RelabelAttachmentTargetFieldsCommand(
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
      { find: findMock, update: updateMock } as never,
    );
  });

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
    } as never);

  it('relabels untouched standard and custom object siblings only', async () => {
    findMock.mockResolvedValue([
      buildField({
        id: 'standard-task',
        label: 'Task',
        universalIdentifier: ATTACHMENT_FIELDS.targetTask.universalIdentifier,
      }),
      buildField({
        id: 'standard-note-renamed',
        label: 'Meeting note',
        universalIdentifier: ATTACHMENT_FIELDS.targetNote.universalIdentifier,
      }),
      buildField({
        id: 'custom-pet',
        label: 'Pet',
        applicationId: CUSTOM_APPLICATION_ID,
        relationTargetObjectNameSingular: 'pet',
      }),
      buildField({
        id: 'custom-rocket-renamed',
        label: 'Launch vehicle',
        applicationId: CUSTOM_APPLICATION_ID,
        relationTargetObjectNameSingular: 'rocket',
      }),
    ]);

    await runOnWorkspace();

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock.mock.calls[0][0].id.value).toEqual([
      'standard-task',
      'custom-pet',
    ]);
    expect(updateMock.mock.calls[0][1]).toEqual({ label: 'Attached to' });
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
  });

  it('writes nothing on a dry run', async () => {
    findMock.mockResolvedValue([
      buildField({
        id: 'standard-task',
        label: 'Task',
        universalIdentifier: ATTACHMENT_FIELDS.targetTask.universalIdentifier,
      }),
    ]);

    await runOnWorkspace(true);

    expect(updateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('is a no-op once every sibling is relabelled', async () => {
    findMock.mockResolvedValue([
      buildField({
        id: 'standard-task',
        label: 'Attached to',
        universalIdentifier: ATTACHMENT_FIELDS.targetTask.universalIdentifier,
      }),
    ]);

    await runOnWorkspace();

    expect(updateMock).not.toHaveBeenCalled();
  });
});
