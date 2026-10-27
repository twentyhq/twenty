import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  getSystemViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SyncWorkspaceMemberRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793117418686-sync-workspace-member-record-page.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { type WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const CUSTOM_APPLICATION = '20202020-3333-4333-8333-333333333333';
const MEMBER = STANDARD_OBJECTS.workspaceMember;
const PAGE =
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workspaceMemberRecordPage;
const VIEW = MEMBER.views.workspaceMemberRecordPageFields;
const createMaps = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: '2026-10-27T00:00:00.000Z',
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: APPLICATION_ID,
  }).allFlatEntityMaps;
const args = { workspaceId: WORKSPACE_ID, options: {}, index: 0, total: 1 };
type MigrationArgs = Parameters<
  WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
>[0];

describe('SyncWorkspaceMemberRecordPageCommand', () => {
  let maps: ReturnType<typeof createMaps>;
  let command: SyncWorkspaceMemberRecordPageCommand;
  let migrate: jest.Mock<Promise<{ status: 'success' }>, [MigrationArgs]>;

  beforeEach(() => {
    maps = createMaps();
    migrate = jest.fn().mockResolvedValue({ status: 'success' });
    command = new SyncWorkspaceMemberRecordPageCommand(
      {} as WorkspaceIteratorService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: {
              id: APPLICATION_ID,
              universalIdentifier:
                TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          }),
      } as unknown as ApplicationService,
      {
        getOrRecompute: jest.fn().mockImplementation(async () => maps),
      } as unknown as WorkspaceCacheService,
      {
        validateBuildAndRunLegacyWorkspaceMigration: migrate,
      } as unknown as WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  const removePage = () => {
    delete maps.flatPageLayoutMaps.byUniversalIdentifier[
      PAGE.universalIdentifier
    ];
    delete maps.flatPageLayoutTabMaps.byUniversalIdentifier[
      PAGE.tabs.home.universalIdentifier
    ];
    delete maps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
      PAGE.tabs.home.widgets.fields.universalIdentifier
    ];
    delete maps.flatViewMaps.byUniversalIdentifier[VIEW.universalIdentifier];
    for (const field of Object.values(
      maps.flatViewFieldMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      if (field.viewUniversalIdentifier === VIEW.universalIdentifier)
        delete maps.flatViewFieldMaps.byUniversalIdentifier[
          field.universalIdentifier
        ];
    }
    for (const group of Object.values(
      maps.flatViewFieldGroupMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      if (group.viewUniversalIdentifier === VIEW.universalIdentifier)
        delete maps.flatViewFieldGroupMaps.byUniversalIdentifier[
          group.universalIdentifier
        ];
    }
  };

  const addRelation = (overrides: Partial<FlatFieldMetadata> = {}) => {
    const field = {
      ...maps.flatFieldMetadataMaps.byUniversalIdentifier[
        MEMBER.fields.assignedTasks.universalIdentifier
      ]!,
      id: '20202020-4444-4444-8444-444444444444',
      universalIdentifier: '20202020-5555-4555-8555-555555555555',
      applicationId: '20202020-6666-4666-8666-666666666666',
      applicationUniversalIdentifier: CUSTOM_APPLICATION,
      name: 'assignedTickets',
      ...overrides,
    } as FlatFieldMetadata;
    maps.flatFieldMetadataMaps.byUniversalIdentifier[
      field.universalIdentifier
    ] = field;
    return field;
  };

  it('creates the whole member page and backfills pre-existing relations under their owning application', async () => {
    removePage();
    const relation = addRelation();
    await command.runOnWorkspace(args);
    expect(migrate).toHaveBeenCalledTimes(2);
    const standard = migrate.mock.calls[0][0];
    expect(standard.applicationUniversalIdentifier).toBe(
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    );
    const operations = standard.allFlatEntityOperationByMetadataName;
    expect(operations.pageLayout?.flatEntityToCreate).toEqual([
      expect.objectContaining({
        objectMetadataUniversalIdentifier: MEMBER.universalIdentifier,
      }),
    ]);
    expect(operations.viewField?.flatEntityToCreate).toHaveLength(7);
    expect(operations.viewFieldGroup?.flatEntityToCreate).toHaveLength(3);
    expect(operations.pageLayoutTab?.flatEntityToCreate).toHaveLength(1);
    expect(operations.pageLayoutWidget?.flatEntityToCreate).toHaveLength(1);
    for (const operation of Object.values(operations)) {
      expect(operation.flatEntityToDelete).toEqual([]);
      expect(operation.flatEntityToUpdate).toEqual([]);
    }
    const custom = migrate.mock.calls[1][0];
    expect(custom.applicationUniversalIdentifier).toBe(CUSTOM_APPLICATION);
    expect(
      custom.allFlatEntityOperationByMetadataName.viewField?.flatEntityToCreate,
    ).toEqual([
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: relation.universalIdentifier,
        applicationUniversalIdentifier: CUSTOM_APPLICATION,
        viewUniversalIdentifier: VIEW.universalIdentifier,
        viewFieldGroupUniversalIdentifier:
          VIEW.viewFieldGroups.relations.universalIdentifier,
        position: 3,
        isVisible: true,
        isSystemSideEffect: true,
      }),
    ]);
  });

  it('is a no-op when the page and relations are already present', async () => {
    const relation = addRelation();
    const viewField = {
      ...maps.flatViewFieldMaps.byUniversalIdentifier[
        VIEW.viewFields.assignedTasks.universalIdentifier
      ]!,
      universalIdentifier: '20202020-7777-4777-8777-777777777777',
      fieldMetadataUniversalIdentifier: relation.universalIdentifier,
      applicationUniversalIdentifier: CUSTOM_APPLICATION,
      isVisible: false,
      position: 42,
    };
    maps.flatViewFieldMaps.byUniversalIdentifier[
      viewField.universalIdentifier
    ] = viewField;
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
    expect(viewField).toMatchObject({ isVisible: false, position: 42 });
  });

  it('can finish the custom-relation phase after the standard page was already created', async () => {
    addRelation();
    await command.up(args);
    expect(migrate).toHaveBeenCalledTimes(1);
    expect(migrate.mock.calls[0][0].applicationUniversalIdentifier).toBe(
      CUSTOM_APPLICATION,
    );
  });

  it('binds a missing widget to the existing fields view', async () => {
    delete maps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
      PAGE.tabs.home.widgets.fields.universalIdentifier
    ];
    await command.up(args);
    const widget =
      migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName
        .pageLayoutWidget?.flatEntityToCreate[0];
    expect(widget).toMatchObject({
      configuration: {
        viewId:
          maps.flatViewMaps.byUniversalIdentifier[VIEW.universalIdentifier]!.id,
      },
    });
  });

  it.each(['inactive', 'otherObject', 'notRelation'] as const)(
    'skips %s custom fields',
    async (kind) => {
      addRelation(
        kind === 'inactive'
          ? { isActive: false }
          : kind === 'otherObject'
            ? {
                objectMetadataUniversalIdentifier:
                  STANDARD_OBJECTS.company.universalIdentifier,
              }
            : { type: FieldMetadataType.TEXT },
      );
      await command.up(args);
      expect(migrate).not.toHaveBeenCalled();
    },
  );

  it.each([true, false])(
    'preserves a deleted relation view field, canonical identifier: %s',
    async (useCanonicalIdentifier) => {
      const relation = addRelation();
      const universalIdentifier = useCanonicalIdentifier
        ? getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier: CUSTOM_APPLICATION,
            viewUniversalIdentifier: VIEW.universalIdentifier,
            fieldMetadataUniversalIdentifier: relation.universalIdentifier,
          })
        : '20202020-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
      maps.flatViewFieldMaps.byUniversalIdentifier[universalIdentifier] = {
        ...maps.flatViewFieldMaps.byUniversalIdentifier[
          VIEW.viewFields.assignedTasks.universalIdentifier
        ]!,
        universalIdentifier,
        fieldMetadataUniversalIdentifier: relation.universalIdentifier,
        deletedAt: '2026-10-26T00:00:00.000Z',
      };
      await command.up(args);
      expect(migrate).not.toHaveBeenCalled();
    },
  );

  it.each([
    'flatPageLayoutMaps',
    'flatPageLayoutTabMaps',
    'flatViewMaps',
  ] as const)('preserves a deleted parent in %s', async (mapName) => {
    const identifier =
      mapName === 'flatPageLayoutMaps'
        ? PAGE.universalIdentifier
        : mapName === 'flatPageLayoutTabMaps'
          ? PAGE.tabs.home.universalIdentifier
          : VIEW.universalIdentifier;
    maps[mapName].byUniversalIdentifier[identifier]!.deletedAt =
      '2026-10-26T00:00:00.000Z';
    addRelation();
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
  });

  it('preserves an existing standard field with another identifier', async () => {
    const identifier = VIEW.viewFields.assignedTasks.universalIdentifier;
    const existingField =
      maps.flatViewFieldMaps.byUniversalIdentifier[identifier]!;
    delete maps.flatViewFieldMaps.byUniversalIdentifier[identifier];
    const replacementIdentifier = '20202020-8888-4888-8888-888888888888';
    maps.flatViewFieldMaps.byUniversalIdentifier[replacementIdentifier] = {
      ...existingField,
      universalIdentifier: replacementIdentifier,
      isVisible: false,
    };
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
  });

  it('keeps new relations hidden when the widget defaults to hidden fields', async () => {
    addRelation();
    const widget =
      maps.flatPageLayoutWidgetMaps.byUniversalIdentifier[
        PAGE.tabs.home.widgets.fields.universalIdentifier
      ]!;
    widget.universalConfiguration = {
      ...widget.universalConfiguration,
      newFieldDefaultVisibility: false,
    } as typeof widget.universalConfiguration;
    await command.up(args);
    expect(
      migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName.viewField
        ?.flatEntityToCreate,
    ).toEqual([expect.objectContaining({ isVisible: false })]);
  });

  it('does not recreate fields under a deleted relations group', async () => {
    addRelation();
    maps.flatViewFieldGroupMaps.byUniversalIdentifier[
      VIEW.viewFieldGroups.relations.universalIdentifier
    ]!.deletedAt = '2026-10-26T00:00:00.000Z';
    delete maps.flatViewFieldMaps.byUniversalIdentifier[
      VIEW.viewFields.assignedTasks.universalIdentifier
    ];
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
  });

  it('keeps relation ownership separate across applications', async () => {
    const first = addRelation();
    const second = addRelation({
      universalIdentifier: '20202020-9999-4999-8999-999999999999',
      applicationUniversalIdentifier: '20202020-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      type: FieldMetadataType.MORPH_RELATION,
      name: 'assignedWork',
    });
    await command.up(args);
    expect(migrate).toHaveBeenCalledTimes(2);
    expect(
      migrate.mock.calls.map(
        ([migration]) => migration.applicationUniversalIdentifier,
      ),
    ).toEqual([
      first.applicationUniversalIdentifier,
      second.applicationUniversalIdentifier,
    ]);
    expect(
      migrate.mock.calls.map(
        ([migration]) =>
          migration.allFlatEntityOperationByMetadataName.viewField
            ?.flatEntityToCreate[0]?.position,
      ),
    ).toEqual([3, 4]);
  });

  it('does not migrate on dry run', async () => {
    removePage();
    addRelation();
    await command.up({ ...args, options: { dryRun: true } });
    expect(migrate).not.toHaveBeenCalled();
  });

  it('does not touch workspaces without the member object', async () => {
    delete maps.flatObjectMetadataMaps.byUniversalIdentifier[
      MEMBER.universalIdentifier
    ];
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
  });

  it('rolls back only this member page and its fields view', async () => {
    await command.down(args);
    const operations =
      migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName;
    expect(operations.pageLayout?.flatEntityToDelete).toEqual([
      expect.objectContaining({
        universalIdentifier: PAGE.universalIdentifier,
      }),
    ]);
    expect(operations.view?.flatEntityToDelete).toEqual([
      expect.objectContaining({
        universalIdentifier: VIEW.universalIdentifier,
      }),
    ]);
    expect(operations.viewField?.flatEntityToDelete).toHaveLength(7);
    expect(operations.pageLayoutWidget?.flatEntityToDelete).toHaveLength(1);
    expect(operations.viewFieldGroup?.flatEntityToDelete).toHaveLength(3);
  });
});
