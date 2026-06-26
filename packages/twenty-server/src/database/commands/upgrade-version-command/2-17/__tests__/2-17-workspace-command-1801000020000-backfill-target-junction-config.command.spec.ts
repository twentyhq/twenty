import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { BackfillTargetJunctionConfigCommand } from 'src/database/commands/upgrade-version-command/2-17/2-17-workspace-command-1801000020000-backfill-target-junction-config.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = 'workspace-id';
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER = 'standard-app-uid';

const TARGET_FIELDS = {
  noteNote: {
    uid: STANDARD_OBJECTS.noteTarget.fields.note.universalIdentifier,
    id: 'note-far-field-id',
  },
  taskTask: {
    uid: STANDARD_OBJECTS.taskTarget.fields.task.universalIdentifier,
    id: 'task-far-field-id',
  },
  noteMorph: {
    uid: STANDARD_OBJECTS.noteTarget.fields.targetPerson.universalIdentifier,
    id: 'note-morph-field-id',
  },
  taskMorph: {
    uid: STANDARD_OBJECTS.taskTarget.fields.targetCompany.universalIdentifier,
    id: 'task-morph-field-id',
  },
} as const;

const SOURCE_FIELDS = [
  {
    uid: STANDARD_OBJECTS.person.fields.noteTargets.universalIdentifier,
    target: TARGET_FIELDS.noteNote,
  },
  {
    uid: STANDARD_OBJECTS.person.fields.taskTargets.universalIdentifier,
    target: TARGET_FIELDS.taskTask,
  },
  {
    uid: STANDARD_OBJECTS.company.fields.noteTargets.universalIdentifier,
    target: TARGET_FIELDS.noteNote,
  },
  {
    uid: STANDARD_OBJECTS.company.fields.taskTargets.universalIdentifier,
    target: TARGET_FIELDS.taskTask,
  },
  {
    uid: STANDARD_OBJECTS.opportunity.fields.noteTargets.universalIdentifier,
    target: TARGET_FIELDS.noteNote,
  },
  {
    uid: STANDARD_OBJECTS.opportunity.fields.taskTargets.universalIdentifier,
    target: TARGET_FIELDS.taskTask,
  },
  {
    uid: STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
    target: TARGET_FIELDS.noteMorph,
  },
  {
    uid: STANDARD_OBJECTS.task.fields.taskTargets.universalIdentifier,
    target: TARGET_FIELDS.taskMorph,
  },
];

type FieldOverrides = Partial<{
  type: FieldMetadataType;
  junctionTargetFieldId: string;
}>;

const buildSourceField = (
  uid: string,
  overrides: FieldOverrides = {},
): FlatFieldMetadata =>
  ({
    id: `${uid}-source-id`,
    universalIdentifier: uid,
    type: overrides.type ?? FieldMetadataType.RELATION,
    settings: {
      relationType: 'ONE_TO_MANY',
      ...(overrides.junctionTargetFieldId
        ? { junctionTargetFieldId: overrides.junctionTargetFieldId }
        : {}),
    },
    universalSettings: { relationType: 'ONE_TO_MANY' },
  }) as unknown as FlatFieldMetadata;

const buildTargetField = (uid: string, id: string): FlatFieldMetadata =>
  ({
    id,
    universalIdentifier: uid,
    type: FieldMetadataType.RELATION,
  }) as unknown as FlatFieldMetadata;

const buildFlatFieldMetadataMaps = ({
  sourceOverridesByUid = {},
  omitUids = [],
}: {
  sourceOverridesByUid?: Record<string, FieldOverrides>;
  omitUids?: string[];
} = {}) => {
  const byUniversalIdentifier: Record<string, FlatFieldMetadata> = {};

  for (const target of Object.values(TARGET_FIELDS)) {
    if (omitUids.includes(target.uid)) {
      continue;
    }
    byUniversalIdentifier[target.uid] = buildTargetField(target.uid, target.id);
  }

  for (const source of SOURCE_FIELDS) {
    if (omitUids.includes(source.uid)) {
      continue;
    }
    byUniversalIdentifier[source.uid] = buildSourceField(
      source.uid,
      sourceOverridesByUid[source.uid],
    );
  }

  return { byUniversalIdentifier };
};

const armedSourceOverrides = (): Record<string, FieldOverrides> =>
  Object.fromEntries(
    SOURCE_FIELDS.map((source) => [
      source.uid,
      { junctionTargetFieldId: 'already-armed' },
    ]),
  );

describe('BackfillTargetJunctionConfigCommand', () => {
  let command: BackfillTargetJunctionConfigCommand;
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'getOrRecompute'>
  >;
  let applicationService: jest.Mocked<
    Pick<
      ApplicationService,
      'findWorkspaceTwentyStandardAndCustomApplicationOrThrow'
    >
  >;
  let validateBuildAndRunWorkspaceMigration: jest.Mock;

  const runWith = async ({
    maps,
    dryRun = false,
  }: {
    maps: ReturnType<typeof buildFlatFieldMetadataMaps>;
    dryRun?: boolean;
  }) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      flatFieldMetadataMaps: maps,
    } as never);

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
    } as never);
  };

  const getUpdatedFields = (): FlatFieldMetadata[] =>
    validateBuildAndRunWorkspaceMigration.mock.calls[0][0]
      .allFlatEntityOperationByMetadataName.fieldMetadata.flatEntityToUpdate;

  beforeEach(() => {
    jest.clearAllMocks();

    workspaceCacheService = {
      getOrRecompute: jest.fn(),
    } as never;

    applicationService = {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            universalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        }),
    } as never;

    validateBuildAndRunWorkspaceMigration = jest
      .fn()
      .mockResolvedValue({ status: 'success' });

    const workspaceMigrationValidateBuildAndRunService = {
      validateBuildAndRunWorkspaceMigration,
    } as unknown as WorkspaceMigrationValidateBuildAndRunService;

    command = new BackfillTargetJunctionConfigCommand(
      {} as never,
      applicationService as unknown as ApplicationService,
      workspaceCacheService as unknown as WorkspaceCacheService,
      workspaceMigrationValidateBuildAndRunService,
    );
  });

  it('arms every target-side and morph-side field with the correct junction target', async () => {
    await runWith({ maps: buildFlatFieldMetadataMaps() });

    expect(validateBuildAndRunWorkspaceMigration).toHaveBeenCalledTimes(1);

    const callArg = validateBuildAndRunWorkspaceMigration.mock.calls[0][0];

    expect(callArg.workspaceId).toBe(WORKSPACE_ID);
    expect(callArg.isSystemBuild).toBe(true);
    expect(callArg.applicationUniversalIdentifier).toBe(
      STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    const updatedFields = getUpdatedFields();

    expect(updatedFields).toHaveLength(SOURCE_FIELDS.length);

    for (const source of SOURCE_FIELDS) {
      const updatedField = updatedFields.find(
        (field) => field.universalIdentifier === source.uid,
      );

      expect(updatedField).toBeDefined();
      expect(updatedField?.settings).toMatchObject({
        junctionTargetFieldId: source.target.id,
      });
      expect(updatedField?.universalSettings).toMatchObject({
        junctionTargetFieldUniversalIdentifier: source.target.uid,
      });
    }
  });

  it('resolves morph-side fields to a morph sub-field id, not the far note/task field', async () => {
    await runWith({ maps: buildFlatFieldMetadataMaps() });

    const updatedFields = getUpdatedFields();

    const noteMorphField = updatedFields.find(
      (field) =>
        field.universalIdentifier ===
        STANDARD_OBJECTS.note.fields.noteTargets.universalIdentifier,
    );

    expect(noteMorphField?.settings).toMatchObject({
      junctionTargetFieldId: TARGET_FIELDS.noteMorph.id,
    });
  });

  it('skips fields already armed and only updates the remaining ones', async () => {
    const alreadyArmedUid =
      STANDARD_OBJECTS.person.fields.noteTargets.universalIdentifier;

    await runWith({
      maps: buildFlatFieldMetadataMaps({
        sourceOverridesByUid: {
          [alreadyArmedUid]: { junctionTargetFieldId: 'already-armed' },
        },
      }),
    });

    const updatedFields = getUpdatedFields();

    expect(updatedFields).toHaveLength(SOURCE_FIELDS.length - 1);
    expect(
      updatedFields.some(
        (field) => field.universalIdentifier === alreadyArmedUid,
      ),
    ).toBe(false);
  });

  it('is a no-op when every field is already armed (idempotent)', async () => {
    await runWith({
      maps: buildFlatFieldMetadataMaps({
        sourceOverridesByUid: armedSourceOverrides(),
      }),
    });

    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
  });

  it('skips a field whose far target field is missing in the workspace', async () => {
    await runWith({
      maps: buildFlatFieldMetadataMaps({
        omitUids: [TARGET_FIELDS.taskTask.uid],
      }),
    });

    const updatedFields = getUpdatedFields();

    expect(updatedFields).toHaveLength(SOURCE_FIELDS.length - 3);
  });

  it('skips a source field that is not a RELATION field', async () => {
    const morphSourceUid =
      STANDARD_OBJECTS.person.fields.noteTargets.universalIdentifier;

    await runWith({
      maps: buildFlatFieldMetadataMaps({
        sourceOverridesByUid: {
          [morphSourceUid]: { type: FieldMetadataType.MORPH_RELATION },
        },
      }),
    });

    const updatedFields = getUpdatedFields();

    expect(updatedFields).toHaveLength(SOURCE_FIELDS.length - 1);
    expect(
      updatedFields.some(
        (field) => field.universalIdentifier === morphSourceUid,
      ),
    ).toBe(false);
  });

  it('does not run the migration on a dry run', async () => {
    await runWith({ maps: buildFlatFieldMetadataMaps(), dryRun: true });

    expect(validateBuildAndRunWorkspaceMigration).not.toHaveBeenCalled();
    expect(
      applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow,
    ).not.toHaveBeenCalled();
  });

  it('throws when the migration fails', async () => {
    validateBuildAndRunWorkspaceMigration.mockResolvedValue({ status: 'fail' });

    await expect(
      runWith({ maps: buildFlatFieldMetadataMaps() }),
    ).rejects.toThrow(`Failed to arm junction config for workspace ${WORKSPACE_ID}`);
  });
});
