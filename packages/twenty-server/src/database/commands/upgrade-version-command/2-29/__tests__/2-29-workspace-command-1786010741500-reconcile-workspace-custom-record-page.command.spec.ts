import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReconcileWorkspaceCustomRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-29/2-29-workspace-command-1786010741500-reconcile-workspace-custom-record-page.command';
import {
  buildByUniversalIdentifierMap,
  type FlatEntityFixture,
  buildDerivedRecordPageStackUniversalIdentifiers,
  buildUnderivedRecordPageStack,
  CUSTOM_APPLICATION_ID,
  CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  FIELD_UNIVERSAL_IDENTIFIER,
  STANDARD_APPLICATION_ID,
  STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  WORKSPACE_ID,
} from 'src/database/commands/upgrade-version-command/2-29/__tests__/record-page-reconcile-test-setup';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { ViewFieldGroupEntity } from 'src/engine/metadata-modules/view-field-group/entities/view-field-group.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bb';
const STANDARD_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bc';

const DERIVED = buildDerivedRecordPageStackUniversalIdentifiers({
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
});

// The system stack of a custom object: workspace-custom-owned, either from
// the incremental createOneObject path or de-owned from 1-23 by the standard
// reconcile.
const SYSTEM_STACK = buildUnderivedRecordPageStack({
  idPrefix: 'system',
  objectUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  isSystemSideEffect: true,
});

const CUSTOM_OBJECT_METADATA = {
  universalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const STANDARD_OBJECT_METADATA = {
  universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const FIELD_METADATA = {
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
};

describe('ReconcileWorkspaceCustomRecordPageCommand', () => {
  let command: ReconcileWorkspaceCustomRecordPageCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let updateMocksByEntity: Map<unknown, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    updateMocksByEntity = new Map(
      [
        PageLayoutEntity,
        PageLayoutTabEntity,
        PageLayoutWidgetEntity,
        ViewEntity,
        ViewFieldEntity,
        ViewFieldGroupEntity,
      ].map((entity) => [entity, jest.fn().mockResolvedValue(undefined)]),
    );

    const entityManagerMock = {
      getRepository: (entity: unknown) => {
        const updateMock = updateMocksByEntity.get(entity);

        if (updateMock === undefined) {
          throw new Error('Unexpected repository');
        }

        return { update: updateMock };
      },
    };

    const viewRepositoryMock = {
      manager: {
        transaction: jest.fn(
          async (callback: (entityManager: unknown) => Promise<void>) =>
            callback(entityManagerMock),
        ),
      },
    };

    command = new ReconcileWorkspaceCustomRecordPageCommand(
      {} as WorkspaceIteratorService,
      {
        getOrRecompute: getOrRecomputeMock,
      } as unknown as WorkspaceCacheService,
      {
        invalidateCache: invalidateCacheMock,
      } as unknown as WorkspaceMigrationRunnerService,
      {
        findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
          .fn()
          .mockResolvedValue({
            twentyStandardFlatApplication: {
              id: STANDARD_APPLICATION_ID,
              universalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
            workspaceCustomFlatApplication: {
              id: CUSTOM_APPLICATION_ID,
              universalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          }),
      } as unknown as ApplicationService,
      viewRepositoryMock as never,
    );
  });

  const mockWorkspaceCache = ({
    objects = [CUSTOM_OBJECT_METADATA],
    views = [SYSTEM_STACK.view],
    viewFields = [SYSTEM_STACK.viewField],
    pageLayouts = [SYSTEM_STACK.pageLayout],
    pageLayoutTabs = [SYSTEM_STACK.homeTab],
    pageLayoutWidgets = [SYSTEM_STACK.fieldsWidget],
  }: {
    objects?: FlatEntityFixture[];
    views?: FlatEntityFixture[];
    viewFields?: FlatEntityFixture[];
    pageLayouts?: FlatEntityFixture[];
    pageLayoutTabs?: FlatEntityFixture[];
    pageLayoutWidgets?: FlatEntityFixture[];
  } = {}) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(views),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
      flatViewFieldGroupMaps: buildByUniversalIdentifierMap([]),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap(objects),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap([FIELD_METADATA]),
      flatPageLayoutMaps: buildByUniversalIdentifierMap(pageLayouts),
      flatPageLayoutTabMaps: buildByUniversalIdentifierMap(pageLayoutTabs),
      flatPageLayoutWidgetMaps:
        buildByUniversalIdentifierMap(pageLayoutWidgets),
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('re-owns the single workspace-custom stack of a custom object', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    expect(updateMocksByEntity.get(PageLayoutEntity)).toHaveBeenCalledWith(
      { id: SYSTEM_STACK.pageLayout.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED.pageLayout },
    );
    expect(updateMocksByEntity.get(ViewEntity)).toHaveBeenCalledWith(
      { id: SYSTEM_STACK.view.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED.view,
      },
    );
    expect(updateMocksByEntity.get(ViewFieldEntity)).toHaveBeenCalledWith(
      { id: SYSTEM_STACK.viewField.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED.viewField,
        isSystemSideEffect: true,
      },
    );
    expect(invalidateCacheMock).toHaveBeenCalled();
  });

  it('re-owns an unflagged single stack (pre-2-15 incremental rows)', async () => {
    const unflaggedStack = buildUnderivedRecordPageStack({
      idPrefix: 'unflagged',
      objectUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      isSystemSideEffect: false,
    });

    mockWorkspaceCache({
      views: [unflaggedStack.view],
      viewFields: [unflaggedStack.viewField],
      pageLayouts: [unflaggedStack.pageLayout],
      pageLayoutTabs: [unflaggedStack.homeTab],
      pageLayoutWidgets: [unflaggedStack.fieldsWidget],
    });

    await runOnWorkspace();

    expect(updateMocksByEntity.get(PageLayoutEntity)).toHaveBeenCalledWith(
      { id: unflaggedStack.pageLayout.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED.pageLayout,
        isSystemSideEffect: true,
      },
    );
  });

  it('picks the single flagged candidate among several and leaves the custom one untouched', async () => {
    const callerCustomLayout = {
      ...SYSTEM_STACK.pageLayout,
      id: 'caller-custom-layout-db-id',
      universalIdentifier: 'caller-custom-layout-universal-identifier',
      isSystemSideEffect: false,
      tabUniversalIdentifiers: [],
    };

    mockWorkspaceCache({
      // The caller custom comes first: the flag must decide, not order.
      pageLayouts: [callerCustomLayout, SYSTEM_STACK.pageLayout],
    });

    await runOnWorkspace();

    expect(updateMocksByEntity.get(PageLayoutEntity)).toHaveBeenCalledTimes(1);
    expect(updateMocksByEntity.get(PageLayoutEntity)).toHaveBeenCalledWith(
      { id: SYSTEM_STACK.pageLayout.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED.pageLayout },
    );
  });

  it('skips the object when several candidates are ambiguous', async () => {
    const firstUnflaggedLayout = {
      ...SYSTEM_STACK.pageLayout,
      isSystemSideEffect: false,
    };
    const secondUnflaggedLayout = {
      ...SYSTEM_STACK.pageLayout,
      id: 'second-layout-db-id',
      universalIdentifier: 'second-layout-universal-identifier',
      isSystemSideEffect: false,
      tabUniversalIdentifiers: [],
    };

    mockWorkspaceCache({
      pageLayouts: [firstUnflaggedLayout, secondUnflaggedLayout],
    });

    await runOnWorkspace();

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
  });

  it('leaves workspace-custom layouts of standard objects untouched', async () => {
    const customLayoutOnStandardObject = {
      ...SYSTEM_STACK.pageLayout,
      objectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIER,
    };

    mockWorkspaceCache({
      objects: [STANDARD_OBJECT_METADATA],
      pageLayouts: [customLayoutOnStandardObject],
    });

    await runOnWorkspace();

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
  });

  it('is idempotent: a fully derived stack yields no update', async () => {
    mockWorkspaceCache({
      views: [
        {
          ...SYSTEM_STACK.view,
          universalIdentifier: DERIVED.view,
          viewFieldUniversalIdentifiers: [DERIVED.viewField],
        },
      ],
      viewFields: [
        {
          ...SYSTEM_STACK.viewField,
          universalIdentifier: DERIVED.viewField,
          isSystemSideEffect: true,
        },
      ],
      pageLayouts: [
        {
          ...SYSTEM_STACK.pageLayout,
          universalIdentifier: DERIVED.pageLayout,
          tabUniversalIdentifiers: [DERIVED.homeTab],
        },
      ],
      pageLayoutTabs: [
        {
          ...SYSTEM_STACK.homeTab,
          universalIdentifier: DERIVED.homeTab,
          widgetUniversalIdentifiers: [DERIVED.fieldsWidget],
        },
      ],
      pageLayoutWidgets: [
        {
          ...SYSTEM_STACK.fieldsWidget,
          universalIdentifier: DERIVED.fieldsWidget,
        },
      ],
    });

    await runOnWorkspace();

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
