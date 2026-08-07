import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReconcileStandardRecordPageCommand } from 'src/database/commands/upgrade-version-command/2-29/2-29-workspace-command-1786010741000-reconcile-standard-record-page.command';
import { PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-29/constants/pre-2-29-standard-record-page-layout-universal-identifier-by-object-universal-identifier.constant';
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

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company;
const COMPANY_PRE_2_29_LAYOUT_UNIVERSAL_IDENTIFIER =
  PRE_2_29_STANDARD_RECORD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIER_BY_OBJECT_UNIVERSAL_IDENTIFIER[
    COMPANY_OBJECT_UNIVERSAL_IDENTIFIER
  ];
const CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bb';

const DERIVED = buildDerivedRecordPageStackUniversalIdentifiers({
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
});

// The curated company stack, still on its pre-2.29 pinned literal.
const CURATED_STACK = (() => {
  const stack = buildUnderivedRecordPageStack({
    idPrefix: 'company',
    objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
    applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    withGroup: true,
  });

  return {
    ...stack,
    pageLayout: {
      ...stack.pageLayout,
      universalIdentifier: COMPANY_PRE_2_29_LAYOUT_UNIVERSAL_IDENTIFIER,
    },
  };
})();

// A 1-23-era stack: custom object, whole stack authored under twenty-standard.
const ONE_23_ERA_STACK = buildUnderivedRecordPageStack({
  idPrefix: 'legacy-custom',
  objectUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  isSystemSideEffect: false,
});

const COMPANY_OBJECT_METADATA = {
  universalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const CUSTOM_OBJECT_METADATA = {
  universalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const FIELD_METADATA = {
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

describe('ReconcileStandardRecordPageCommand', () => {
  let command: ReconcileStandardRecordPageCommand;
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

    command = new ReconcileStandardRecordPageCommand(
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
    objects = [COMPANY_OBJECT_METADATA],
    views = [CURATED_STACK.view],
    viewFields = [CURATED_STACK.viewField],
    viewFieldGroups = CURATED_STACK.viewFieldGroup
      ? [CURATED_STACK.viewFieldGroup]
      : [],
    pageLayouts = [CURATED_STACK.pageLayout],
    pageLayoutTabs = [CURATED_STACK.homeTab],
    pageLayoutWidgets = [CURATED_STACK.fieldsWidget],
  }: {
    objects?: FlatEntityFixture[];
    views?: FlatEntityFixture[];
    viewFields?: FlatEntityFixture[];
    viewFieldGroups?: FlatEntityFixture[];
    pageLayouts?: FlatEntityFixture[];
    pageLayoutTabs?: FlatEntityFixture[];
    pageLayoutWidgets?: FlatEntityFixture[];
  } = {}) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(views),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
      flatViewFieldGroupMaps: buildByUniversalIdentifierMap(viewFieldGroups),
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

  it('re-owns the curated stack located by its pre-2.29 literal', async () => {
    mockWorkspaceCache();

    await runOnWorkspace();

    expect(updateMocksByEntity.get(PageLayoutEntity)).toHaveBeenCalledWith(
      { id: CURATED_STACK.pageLayout.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED.pageLayout },
    );
    expect(updateMocksByEntity.get(PageLayoutTabEntity)).toHaveBeenCalledWith(
      { id: CURATED_STACK.homeTab.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED.homeTab },
    );
    expect(
      updateMocksByEntity.get(PageLayoutWidgetEntity),
    ).toHaveBeenCalledWith(
      { id: CURATED_STACK.fieldsWidget.id, workspaceId: WORKSPACE_ID },
      { universalIdentifier: DERIVED.fieldsWidget },
    );
    expect(updateMocksByEntity.get(ViewEntity)).toHaveBeenCalledWith(
      { id: CURATED_STACK.view.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED.view,
      },
    );
    expect(updateMocksByEntity.get(ViewFieldEntity)).toHaveBeenCalledWith(
      { id: CURATED_STACK.viewField.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED.viewField,
        isSystemSideEffect: true,
      },
    );
    expect(updateMocksByEntity.get(ViewFieldGroupEntity)).toHaveBeenCalledWith(
      { id: CURATED_STACK.viewFieldGroup?.id, workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED.generalGroup,
        isSystemSideEffect: true,
      },
    );
    expect(invalidateCacheMock).toHaveBeenCalled();
  });

  it('is idempotent: a fully derived stack yields no update', async () => {
    mockWorkspaceCache({
      views: [
        {
          ...CURATED_STACK.view,
          universalIdentifier: DERIVED.view,
          viewFieldUniversalIdentifiers: [DERIVED.viewField],
          viewFieldGroupUniversalIdentifiers: [DERIVED.generalGroup],
        },
      ],
      viewFields: [
        {
          ...CURATED_STACK.viewField,
          universalIdentifier: DERIVED.viewField,
          isSystemSideEffect: true,
        },
      ],
      viewFieldGroups: [
        {
          ...CURATED_STACK.viewFieldGroup,
          universalIdentifier: DERIVED.generalGroup,
          isSystemSideEffect: true,
        },
      ],
      pageLayouts: [
        {
          ...CURATED_STACK.pageLayout,
          universalIdentifier: DERIVED.pageLayout,
          tabUniversalIdentifiers: [DERIVED.homeTab],
        },
      ],
      pageLayoutTabs: [
        {
          ...CURATED_STACK.homeTab,
          universalIdentifier: DERIVED.homeTab,
          widgetUniversalIdentifiers: [DERIVED.fieldsWidget],
        },
      ],
      pageLayoutWidgets: [
        {
          ...CURATED_STACK.fieldsWidget,
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

  it('de-owns a 1-23-era custom-object stack to workspace-custom without touching identifiers', async () => {
    mockWorkspaceCache({
      objects: [CUSTOM_OBJECT_METADATA],
      views: [ONE_23_ERA_STACK.view],
      viewFields: [ONE_23_ERA_STACK.viewField],
      viewFieldGroups: [],
      pageLayouts: [ONE_23_ERA_STACK.pageLayout],
      pageLayoutTabs: [ONE_23_ERA_STACK.homeTab],
      pageLayoutWidgets: [ONE_23_ERA_STACK.fieldsWidget],
    });

    await runOnWorkspace();

    expect(updateMocksByEntity.get(PageLayoutEntity)).toHaveBeenCalledWith(
      { id: ONE_23_ERA_STACK.pageLayout.id, workspaceId: WORKSPACE_ID },
      { applicationId: CUSTOM_APPLICATION_ID },
    );
    expect(updateMocksByEntity.get(PageLayoutTabEntity)).toHaveBeenCalledWith(
      { id: ONE_23_ERA_STACK.homeTab.id, workspaceId: WORKSPACE_ID },
      { applicationId: CUSTOM_APPLICATION_ID },
    );
    expect(
      updateMocksByEntity.get(PageLayoutWidgetEntity),
    ).toHaveBeenCalledWith(
      { id: ONE_23_ERA_STACK.fieldsWidget.id, workspaceId: WORKSPACE_ID },
      { applicationId: CUSTOM_APPLICATION_ID },
    );
    expect(updateMocksByEntity.get(ViewEntity)).toHaveBeenCalledWith(
      { id: ONE_23_ERA_STACK.view.id, workspaceId: WORKSPACE_ID },
      { applicationId: CUSTOM_APPLICATION_ID },
    );
    expect(updateMocksByEntity.get(ViewFieldEntity)).toHaveBeenCalledWith(
      { id: ONE_23_ERA_STACK.viewField.id, workspaceId: WORKSPACE_ID },
      { applicationId: CUSTOM_APPLICATION_ID },
    );
    // Identifiers stay untouched: the workspace-custom reconcile re-owns them.
    expect(updateMocksByEntity.get(PageLayoutEntity)).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ universalIdentifier: expect.anything() }),
    );
  });

  it('leaves workspace-custom-owned layouts alone', async () => {
    const customOwnedStack = buildUnderivedRecordPageStack({
      idPrefix: 'custom-owned',
      objectUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    mockWorkspaceCache({
      objects: [CUSTOM_OBJECT_METADATA],
      views: [customOwnedStack.view],
      viewFields: [customOwnedStack.viewField],
      viewFieldGroups: [],
      pageLayouts: [customOwnedStack.pageLayout],
      pageLayoutTabs: [customOwnedStack.homeTab],
      pageLayoutWidgets: [customOwnedStack.fieldsWidget],
    });

    await runOnWorkspace();

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
  });

  it('skips every write in dry-run mode', async () => {
    mockWorkspaceCache();

    await runOnWorkspace(true);

    for (const updateMock of updateMocksByEntity.values()) {
      expect(updateMock).not.toHaveBeenCalled();
    }
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
