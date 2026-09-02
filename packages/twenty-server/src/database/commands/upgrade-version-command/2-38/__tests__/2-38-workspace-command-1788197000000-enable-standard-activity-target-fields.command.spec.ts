import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { EnableStandardActivityTargetFieldsCommand } from 'src/database/commands/upgrade-version-command/2-38/2-38-workspace-command-1788197000000-enable-standard-activity-target-fields.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '00000000-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_ID = '00000000-0000-4000-8000-000000000002';
const EXPECTED_FIELD_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.company.fields.taskTargets.universalIdentifier,
  STANDARD_OBJECTS.company.fields.noteTargets.universalIdentifier,
  STANDARD_OBJECTS.person.fields.taskTargets.universalIdentifier,
  STANDARD_OBJECTS.person.fields.noteTargets.universalIdentifier,
  STANDARD_OBJECTS.opportunity.fields.taskTargets.universalIdentifier,
  STANDARD_OBJECTS.opportunity.fields.noteTargets.universalIdentifier,
];

const buildCommand = ({
  invalidateAndRecompute,
}: {
  invalidateAndRecompute: ReturnType<typeof jest.fn>;
}) =>
  new EnableStandardActivityTargetFieldsCommand(
    {} as WorkspaceIteratorService,
    {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: { id: STANDARD_APPLICATION_ID },
        }),
    } as unknown as ApplicationService,
    { invalidateAndRecompute } as unknown as WorkspaceCacheService,
  );

const runCommand = async ({
  command,
  query,
  dryRun = false,
}: {
  command: EnableStandardActivityTargetFieldsCommand;
  query: ReturnType<typeof jest.fn>;
  dryRun?: boolean;
}) =>
  command.runOnWorkspace({
    workspaceId: WORKSPACE_ID,
    dataSource: { query } as never,
    options: { dryRun },
    index: 0,
    total: 1,
  });

describe('EnableStandardActivityTargetFieldsCommand', () => {
  it('updates only the six standard inverse fields in the workspace standard application', async () => {
    const query = jest.fn().mockResolvedValue([[], 6]);
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);
    const command = buildCommand({ invalidateAndRecompute });

    await runCommand({ command, query });

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][1]).toEqual([
      WORKSPACE_ID,
      STANDARD_APPLICATION_ID,
      EXPECTED_FIELD_UNIVERSAL_IDENTIFIERS,
    ]);
    expect(invalidateAndRecompute).toHaveBeenCalledWith(WORKSPACE_ID, [
      'flatFieldMetadataMaps',
    ]);
  });

  it('is safe to rerun after the fields have already converged', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([[], 6])
      .mockResolvedValueOnce([[], 0]);
    const invalidateAndRecompute = jest.fn().mockResolvedValue(undefined);
    const command = buildCommand({ invalidateAndRecompute });

    jest.spyOn(command['logger'], 'log').mockImplementation();

    await runCommand({ command, query });
    await runCommand({ command, query });

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1]).toEqual(query.mock.calls[0]);
    expect(invalidateAndRecompute).toHaveBeenCalledTimes(2);
    expect(command['logger'].log).toHaveBeenLastCalledWith(
      `Made 0 standard activity target field(s) editable for workspace ${WORKSPACE_ID}`,
    );
  });

  it('does not read or write metadata during a dry run', async () => {
    const query = jest.fn();
    const invalidateAndRecompute = jest.fn();
    const command = buildCommand({ invalidateAndRecompute });

    jest.spyOn(command['logger'], 'log').mockImplementation();

    await runCommand({ command, query, dryRun: true });

    expect(query).not.toHaveBeenCalled();
    expect(invalidateAndRecompute).not.toHaveBeenCalled();
  });
});
