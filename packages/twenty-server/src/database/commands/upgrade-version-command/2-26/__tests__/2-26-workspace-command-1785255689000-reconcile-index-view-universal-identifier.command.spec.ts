import {
  getSystemViewUniversalIdentifier,
  getSystemViewFieldUniversalIdentifier,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ReconcileIndexViewUniversalIdentifierCommand } from 'src/database/commands/upgrade-version-command/2-26/2-26-workspace-command-1785255689000-reconcile-index-view-universal-identifier.command';
import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ad';
const CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000aa';
const EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000ae';
const STANDARD_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bb';
const CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bc';
const FIELD_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-0000000000cc';

const DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER =
  getSystemViewUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIER,
    viewKey: ViewKey.INDEX,
  });
const DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  getSystemViewFieldUniversalIdentifier({
    fieldMetadataApplicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    viewUniversalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
    fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  });

const STANDARD_OBJECT_METADATA = {
  universalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const EXTERNAL_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000000bd';

// An object adopted into another application: its INDEX view can be left
// behind, still attributed to an engine application.
const EXTERNAL_OBJECT_METADATA = {
  universalIdentifier: EXTERNAL_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
};

// A custom object: its INDEX view was historically created with a random v4
// universal identifier by ObjectMetadataService.createOneObject.
const CUSTOM_OBJECT_METADATA = {
  universalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
};

type WorkspaceView = {
  id: string;
  universalIdentifier: string;
  key: ViewKey | null;
  applicationUniversalIdentifier?: string;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
  objectMetadataUniversalIdentifier?: string;
  viewFieldUniversalIdentifiers?: string[];
};

type WorkspaceViewField = {
  id: string;
  universalIdentifier: string;
  applicationUniversalIdentifier?: string;
  fieldMetadataUniversalIdentifier?: string;
  deletedAt?: string | null;
  isSystemSideEffect?: boolean;
};

const buildFlatView = (view: WorkspaceView) => ({
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  deletedAt: null,
  isSystemSideEffect: false,
  objectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIER,
  viewFieldUniversalIdentifiers: [],
  ...view,
});

const buildFlatViewField = (viewField: WorkspaceViewField) => ({
  applicationUniversalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  deletedAt: null,
  isSystemSideEffect: false,
  ...viewField,
});

const buildFlatFieldMetadata = ({
  applicationUniversalIdentifier = STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
}: {
  applicationUniversalIdentifier?: string;
} = {}) => ({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  applicationUniversalIdentifier,
});

const buildByUniversalIdentifierMap = <
  T extends { universalIdentifier: string },
>(
  flatEntities: T[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
});

describe('ReconcileIndexViewUniversalIdentifierCommand', () => {
  let command: ReconcileIndexViewUniversalIdentifierCommand;
  let getOrRecomputeMock: jest.Mock;
  let invalidateCacheMock: jest.Mock;
  let viewUpdateMock: jest.Mock;
  let viewFieldUpdateMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    getOrRecomputeMock = jest.fn();
    invalidateCacheMock = jest.fn().mockResolvedValue(undefined);
    viewUpdateMock = jest.fn().mockResolvedValue(undefined);
    viewFieldUpdateMock = jest.fn().mockResolvedValue(undefined);

    const entityManagerMock = {
      getRepository: (entity: unknown) => {
        if (entity === ViewEntity) {
          return { update: viewUpdateMock };
        }
        if (entity === ViewFieldEntity) {
          return { update: viewFieldUpdateMock };
        }
        throw new Error('Unexpected repository');
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

    command = new ReconcileIndexViewUniversalIdentifierCommand(
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
              universalIdentifier: STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
            workspaceCustomFlatApplication: {
              universalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
            },
          }),
      } as unknown as ApplicationService,
      viewRepositoryMock as never,
    );
  });

  const mockWorkspaceCache = ({
    views,
    viewFields = [],
    fieldMetadatas = [buildFlatFieldMetadata()],
  }: {
    views: ReturnType<typeof buildFlatView>[];
    viewFields?: ReturnType<typeof buildFlatViewField>[];
    fieldMetadatas?: ReturnType<typeof buildFlatFieldMetadata>[];
  }) => {
    getOrRecomputeMock.mockResolvedValue({
      flatViewMaps: buildByUniversalIdentifierMap(views),
      flatViewFieldMaps: buildByUniversalIdentifierMap(viewFields),
      flatObjectMetadataMaps: buildByUniversalIdentifierMap([
        STANDARD_OBJECT_METADATA,
        CUSTOM_OBJECT_METADATA,
        EXTERNAL_OBJECT_METADATA,
      ]),
      flatFieldMetadataMaps: buildByUniversalIdentifierMap(fieldMetadatas),
    });
  };

  const runOnWorkspace = (dryRun = false) =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  it('re-owns an underived standard INDEX view and its view fields', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
          viewFieldUniversalIdentifiers: ['legacy-view-field-uid'],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'view-field-id',
          universalIdentifier: 'legacy-view-field-uid',
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'view-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
    expect(viewFieldUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewFieldUpdateMock).toHaveBeenCalledWith(
      { id: 'view-field-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
    expect(invalidateCacheMock).toHaveBeenCalledTimes(1);
    expect(invalidateCacheMock.mock.calls[0][0].allFlatEntityMapsKeys).toEqual(
      expect.arrayContaining([
        'flatViewMaps',
        'flatViewFieldMaps',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatPageLayoutWidgetMaps',
      ]),
    );
  });

  it('re-owns a custom object INDEX view onto the workspace-custom derivation', async () => {
    const derivedCustomViewUniversalIdentifier =
      getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
        viewKey: ViewKey.INDEX,
      });

    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'custom-view-id',
          universalIdentifier: 'legacy-v4-view-uid',
          key: ViewKey.INDEX,
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
          objectMetadataUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'custom-view-id', workspaceId: WORKSPACE_ID },
      { universalIdentifier: derivedCustomViewUniversalIdentifier },
    );
  });

  it('ignores INDEX views owned by other applications', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'external-view-id',
          universalIdentifier: 'external-view-uid',
          key: ViewKey.INDEX,
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('skips a soft-deleted INDEX view coexisting with an active one on the same object', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'soft-deleted-view-id',
          universalIdentifier: 'soft-deleted-view-uid',
          key: ViewKey.INDEX,
          deletedAt: '2024-01-01T00:00:00.000Z',
        }),
        buildFlatView({
          id: 'active-view-id',
          universalIdentifier: 'active-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'active-view-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
  });

  it('demotes an INDEX view attributed to another application than its object', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'drifted-view-id',
          universalIdentifier: 'drifted-view-uid',
          key: ViewKey.INDEX,
          objectMetadataUniversalIdentifier: EXTERNAL_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'drifted-view-id', workspaceId: WORKSPACE_ID },
      { key: null },
    );
    expect(viewFieldUpdateMock).not.toHaveBeenCalled();
  });

  it('demotes a workspace-custom INDEX view on a standard object next to the standard INDEX view', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'standard-view-id',
          universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          isSystemSideEffect: true,
        }),
        // A legacy caller-created view with key INDEX, attributed to the
        // workspace-custom application but sitting on the standard object.
        buildFlatView({
          id: 'legacy-caller-view-id',
          universalIdentifier: 'legacy-caller-view-uid',
          key: ViewKey.INDEX,
          applicationUniversalIdentifier: CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'legacy-caller-view-id', workspaceId: WORKSPACE_ID },
      { key: null },
    );
  });

  it('skips an INDEX view whose derived identifier is held by a soft-deleted view', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'tombstone-view-id',
          universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          deletedAt: '2024-01-01T00:00:00.000Z',
        }),
        buildFlatView({
          id: 'active-view-id',
          universalIdentifier: 'active-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace();

    // The tombstone still reserves the identifier in the unique index: the
    // active view keeps its identifier rather than crashing the workspace.
    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('skips an INDEX view whose derived identifier is held by another active view', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'holder-view-id',
          universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          isSystemSideEffect: true,
        }),
        buildFlatView({
          id: 'duplicate-view-id',
          universalIdentifier: 'duplicate-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('re-owns only the first of two INDEX views deriving the same identifier when neither holds it', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'first-view-id',
          universalIdentifier: 'first-view-uid',
          key: ViewKey.INDEX,
        }),
        buildFlatView({
          id: 'second-view-id',
          universalIdentifier: 'second-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewUpdateMock).toHaveBeenCalledWith(
      { id: 'first-view-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
  });

  it('skips a view field whose derived identifier is held by a soft-deleted view field', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          isSystemSideEffect: true,
          viewFieldUniversalIdentifiers: [
            DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
            'active-view-field-uid',
          ],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'tombstone-view-field-id',
          universalIdentifier: DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          deletedAt: '2024-01-01T00:00:00.000Z',
        }),
        buildFlatViewField({
          id: 'active-view-field-id',
          universalIdentifier: 'active-view-field-uid',
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(viewFieldUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('re-owns only the active row of a soft-deleted + re-created view field pair', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
          viewFieldUniversalIdentifiers: [
            'soft-deleted-view-field-uid',
            'active-view-field-uid',
          ],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'soft-deleted-view-field-id',
          universalIdentifier: 'soft-deleted-view-field-uid',
          deletedAt: '2024-01-01T00:00:00.000Z',
        }),
        buildFlatViewField({
          id: 'active-view-field-id',
          universalIdentifier: 'active-view-field-uid',
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewFieldUpdateMock).toHaveBeenCalledTimes(1);
    expect(viewFieldUpdateMock).toHaveBeenCalledWith(
      { id: 'active-view-field-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
  });

  it('re-owns an external application view field living on a standard INDEX view', async () => {
    // e.g. an app that declared explicit columns on a standard INDEX view:
    // those must converge on the derived scheme so manifest deletion inference
    // never drops them once the app stops declaring them.
    const derivedExternalViewFieldUniversalIdentifier =
      getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      });

    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
          viewFieldUniversalIdentifiers: ['external-app-view-field-uid'],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'external-app-view-field-id',
          universalIdentifier: 'external-app-view-field-uid',
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ],
      fieldMetadatas: [
        buildFlatFieldMetadata({
          applicationUniversalIdentifier:
            EXTERNAL_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewFieldUpdateMock).toHaveBeenCalledWith(
      { id: 'external-app-view-field-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: derivedExternalViewFieldUniversalIdentifier,
        isSystemSideEffect: true,
      },
    );
  });

  it('derives a view field from the displayed field application, not the row attribution', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
          viewFieldUniversalIdentifiers: ['user-shown-view-field-uid'],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'user-shown-view-field-id',
          universalIdentifier: 'user-shown-view-field-uid',
          applicationUniversalIdentifier:
            CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewFieldUpdateMock).toHaveBeenCalledWith(
      { id: 'user-shown-view-field-id', workspaceId: WORKSPACE_ID },
      {
        universalIdentifier: DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
        isSystemSideEffect: true,
      },
    );
  });

  it('does nothing when the INDEX view and its view fields are already derived and system-owned', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: DERIVED_STANDARD_VIEW_UNIVERSAL_IDENTIFIER,
          key: ViewKey.INDEX,
          isSystemSideEffect: true,
          viewFieldUniversalIdentifiers: [
            DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          ],
        }),
      ],
      viewFields: [
        buildFlatViewField({
          id: 'view-field-id',
          universalIdentifier: DERIVED_STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          isSystemSideEffect: true,
        }),
      ],
    });

    await runOnWorkspace();

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(viewFieldUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });

  it('does not write in dry-run mode', async () => {
    mockWorkspaceCache({
      views: [
        buildFlatView({
          id: 'view-id',
          universalIdentifier: 'legacy-view-uid',
          key: ViewKey.INDEX,
        }),
      ],
    });

    await runOnWorkspace(true);

    expect(viewUpdateMock).not.toHaveBeenCalled();
    expect(viewFieldUpdateMock).not.toHaveBeenCalled();
    expect(invalidateCacheMock).not.toHaveBeenCalled();
  });
});
