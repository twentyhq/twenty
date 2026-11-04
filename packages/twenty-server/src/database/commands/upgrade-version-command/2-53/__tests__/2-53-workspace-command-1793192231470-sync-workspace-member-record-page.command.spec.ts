import { Test } from '@nestjs/testing';
import {
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  getSystemViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { SyncWorkspaceMemberRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-53/2-53-workspace-command-1793192231470-sync-workspace-member-record-page.command';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

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
type MigrationResult = ReturnType<
  WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
>;
type MigrationArgs = Parameters<
  WorkspaceMigrationValidateBuildAndRunService['validateBuildAndRunLegacyWorkspaceMigration']
>[0];

describe('SyncWorkspaceMemberRecordPageCommand', () => {
  let maps: ReturnType<typeof createMaps>;
  let command: SyncWorkspaceMemberRecordPageCommand;
  let migrate: jest.Mock<MigrationResult, [MigrationArgs]>;

  beforeEach(async () => {
    maps = createMaps();
    migrate = jest.fn<MigrationResult, [MigrationArgs]>().mockResolvedValue({
      status: 'success',
      workspaceMigration: {
        actions: [],
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      },
      hasSchemaMetadataChanged: false,
    });
    const applicationService = {
      findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
        .fn()
        .mockResolvedValue({
          twentyStandardFlatApplication: {
            id: APPLICATION_ID,
            universalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          },
        }),
    } satisfies Pick<
      ApplicationService,
      'findWorkspaceTwentyStandardAndCustomApplicationOrThrow'
    >;
    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockImplementation(async () => maps),
    } satisfies Pick<WorkspaceCacheService, 'getOrRecompute'>;
    const workspaceMigrationService = {
      validateBuildAndRunLegacyWorkspaceMigration: migrate,
    } satisfies Pick<
      WorkspaceMigrationValidateBuildAndRunService,
      'validateBuildAndRunLegacyWorkspaceMigration'
    >;
    const module = await Test.createTestingModule({
      providers: [
        SyncWorkspaceMemberRecordPageCommand,
        { provide: WorkspaceIteratorService, useValue: {} },
        { provide: ApplicationService, useValue: applicationService },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: workspaceMigrationService,
        },
      ],
    }).compile();
    command = module.get(SyncWorkspaceMemberRecordPageCommand);
  });

  const removePage = () => {
    maps.flatPageLayoutMaps.byUniversalIdentifier = removePropertiesFromRecord(
      maps.flatPageLayoutMaps.byUniversalIdentifier,
      [PAGE.universalIdentifier],
    );
    maps.flatPageLayoutTabMaps.byUniversalIdentifier =
      removePropertiesFromRecord(
        maps.flatPageLayoutTabMaps.byUniversalIdentifier,
        [PAGE.tabs.home.universalIdentifier],
      );
    maps.flatPageLayoutWidgetMaps.byUniversalIdentifier =
      removePropertiesFromRecord(
        maps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
        [PAGE.tabs.home.widgets.fields.universalIdentifier],
      );
    maps.flatViewMaps.byUniversalIdentifier = removePropertiesFromRecord(
      maps.flatViewMaps.byUniversalIdentifier,
      [VIEW.universalIdentifier],
    );
    maps.flatViewFieldMaps.byUniversalIdentifier = Object.fromEntries(
      Object.entries(maps.flatViewFieldMaps.byUniversalIdentifier).filter(
        ([, field]) =>
          field?.viewUniversalIdentifier !== VIEW.universalIdentifier,
      ),
    );
    maps.flatViewFieldGroupMaps.byUniversalIdentifier = Object.fromEntries(
      Object.entries(maps.flatViewFieldGroupMaps.byUniversalIdentifier).filter(
        ([, group]) =>
          group?.viewUniversalIdentifier !== VIEW.universalIdentifier,
      ),
    );
  };

  const addRelation = (overrides: Partial<FlatFieldMetadata> = {}) => {
    const field = getFlatFieldMetadataMock({
      ...maps.flatFieldMetadataMaps.byUniversalIdentifier[
        MEMBER.fields.assignedTasks.universalIdentifier
      ]!,
      id: '20202020-4444-4444-8444-444444444444',
      universalIdentifier: '20202020-5555-4555-8555-555555555555',
      applicationId: '20202020-6666-4666-8666-666666666666',
      applicationUniversalIdentifier: CUSTOM_APPLICATION,
      name: 'assignedTickets',
      ...overrides,
    });
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
    maps.flatPageLayoutWidgetMaps.byUniversalIdentifier =
      removePropertiesFromRecord(
        maps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
        [PAGE.tabs.home.widgets.fields.universalIdentifier],
      );
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

  it.each([
    { name: 'inactive', overrides: { isActive: false } },
    {
      name: 'other object',
      overrides: {
        objectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.company.universalIdentifier,
      },
    },
    { name: 'non-relation', overrides: { type: FieldMetadataType.TEXT } },
  ])('skips $name custom fields', async ({ overrides }) => {
    addRelation(overrides);
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
  });

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
    { mapName: 'flatPageLayoutMaps', identifier: PAGE.universalIdentifier },
    {
      mapName: 'flatPageLayoutTabMaps',
      identifier: PAGE.tabs.home.universalIdentifier,
    },
    { mapName: 'flatViewMaps', identifier: VIEW.universalIdentifier },
  ] as const)(
    'preserves a deleted parent in $mapName',
    async ({ mapName, identifier }) => {
      maps[mapName].byUniversalIdentifier[identifier]!.deletedAt =
        '2026-10-26T00:00:00.000Z';
      addRelation();
      await command.up(args);
      expect(migrate).not.toHaveBeenCalled();
    },
  );

  it('preserves an existing standard field with another identifier', async () => {
    const identifier = VIEW.viewFields.assignedTasks.universalIdentifier;
    const existingField =
      maps.flatViewFieldMaps.byUniversalIdentifier[identifier]!;
    maps.flatViewFieldMaps.byUniversalIdentifier = removePropertiesFromRecord(
      maps.flatViewFieldMaps.byUniversalIdentifier,
      [identifier],
    );
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
      configurationType: WidgetConfigurationType.FIELDS,
      viewUniversalIdentifier: VIEW.universalIdentifier,
      newFieldDefaultVisibility: false,
    };
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
    maps.flatViewFieldMaps.byUniversalIdentifier = removePropertiesFromRecord(
      maps.flatViewFieldMaps.byUniversalIdentifier,
      [VIEW.viewFields.assignedTasks.universalIdentifier],
    );
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
  });

  it('keeps relation ownership separate across applications', async () => {
    const first = addRelation();
    const second = addRelation({
      universalIdentifier: '20202020-9999-4999-8999-999999999999',
      applicationUniversalIdentifier: '20202020-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: '20202020-9999-4999-8999-999999999999',
      relationTargetObjectMetadataId: null,
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
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

  const addMorphRelation = () => {
    const headIdentifier = '20202020-cccc-4ccc-8ccc-cccccccccccc';
    const head = addRelation({
      universalIdentifier: headIdentifier,
      type: FieldMetadataType.MORPH_RELATION,
      morphId: headIdentifier,
      isSystemSideEffect: true,
      relationTargetObjectMetadataId: null,
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
      name: 'assignedWork',
    });
    addRelation({
      universalIdentifier: '20202020-dddd-4ddd-8ddd-dddddddddddd',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: headIdentifier,
      isSystemSideEffect: false,
      name: 'assignedWorkTask',
    });
    addRelation({
      universalIdentifier: '20202020-eeee-4eee-8eee-eeeeeeeeeeee',
      type: FieldMetadataType.MORPH_RELATION,
      morphId: headIdentifier,
      isSystemSideEffect: true,
      name: 'assignedWorkCompany',
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECTS.company.universalIdentifier,
    });
    return head;
  };

  it('backfills one field for a morph head and keeps ordinary relations', async () => {
    removePage();
    const relation = addRelation();
    const head = addMorphRelation();
    await command.up(args);
    const customFields =
      migrate.mock.calls[1][0].allFlatEntityOperationByMetadataName.viewField
        ?.flatEntityToCreate;
    expect(customFields).toEqual([
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: relation.universalIdentifier,
        position: 3,
      }),
      expect.objectContaining({
        fieldMetadataUniversalIdentifier: head.universalIdentifier,
        universalIdentifier: getSystemViewFieldUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier: CUSTOM_APPLICATION,
          viewUniversalIdentifier: VIEW.universalIdentifier,
          fieldMetadataUniversalIdentifier: head.universalIdentifier,
        }),
        position: 4,
      }),
    ]);
  });

  it('does not create target rows when the morph head is already displayed', async () => {
    const head = addMorphRelation();
    const identifier = getSystemViewFieldUniversalIdentifier({
      fieldMetadataApplicationUniversalIdentifier: CUSTOM_APPLICATION,
      viewUniversalIdentifier: VIEW.universalIdentifier,
      fieldMetadataUniversalIdentifier: head.universalIdentifier,
    });
    maps.flatViewFieldMaps.byUniversalIdentifier[identifier] = {
      ...maps.flatViewFieldMaps.byUniversalIdentifier[
        VIEW.viewFields.assignedTasks.universalIdentifier
      ]!,
      universalIdentifier: identifier,
      fieldMetadataUniversalIdentifier: head.universalIdentifier,
    };
    await command.up(args);
    expect(migrate).not.toHaveBeenCalled();
  });

  it('ignores inactive fields when positioning backfilled relations', async () => {
    addRelation();
    const inactiveField =
      maps.flatViewFieldMaps.byUniversalIdentifier[
        VIEW.viewFields.assignedTasks.universalIdentifier
      ]!;
    inactiveField.isActive = false;
    inactiveField.position = 100;
    await command.up(args);
    expect(
      migrate.mock.calls[0][0].allFlatEntityOperationByMetadataName.viewField
        ?.flatEntityToCreate,
    ).toEqual([expect.objectContaining({ position: 3 })]);
  });

  it('does not migrate on dry run', async () => {
    removePage();
    addRelation();
    await command.up({ ...args, options: { dryRun: true } });
    expect(migrate).not.toHaveBeenCalled();
  });

  it('does not touch workspaces without the member object', async () => {
    maps.flatObjectMetadataMaps.byUniversalIdentifier =
      removePropertiesFromRecord(
        maps.flatObjectMetadataMaps.byUniversalIdentifier,
        [MEMBER.universalIdentifier],
      );
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
