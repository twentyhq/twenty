import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import {
  getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom,
  WORKSPACE_CUSTOM_ADOPTABLE_METADATA_NAMES,
} from 'src/engine/core-modules/application/application-manifest/utils/get-application-scoped-all-flat-entity-maps-for-owner-and-workspace-custom.util';

const buildFlatEntityMaps = <
  T extends {
    id: string;
    workspaceId: string;
    applicationId: string;
    universalIdentifier: string;
  },
>(
  entities: T[],
): FlatEntityMaps<T> => {
  const byUniversalIdentifier: Record<string, T> = {};
  const universalIdentifierById: Record<string, string> = {};
  const universalIdentifiersByApplicationId: Record<string, string[]> = {};

  for (const entity of entities) {
    byUniversalIdentifier[entity.universalIdentifier] = entity;
    universalIdentifierById[entity.id] = entity.universalIdentifier;

    const existing =
      universalIdentifiersByApplicationId[entity.applicationId] ?? [];
    existing.push(entity.universalIdentifier);
    universalIdentifiersByApplicationId[entity.applicationId] = existing;
  }

  return {
    byUniversalIdentifier,
    universalIdentifierById,
    universalIdentifiersByApplicationId,
  } as unknown as FlatEntityMaps<T>;
};

const buildAllFlatEntityMaps = (
  entries: Partial<
    Record<
      AllMetadataName,
      {
        id: string;
        workspaceId: string;
        applicationId: string;
        universalIdentifier: string;
      }[]
    >
  >,
): AllFlatEntityMaps => {
  const result: Partial<AllFlatEntityMaps> = {};

  for (const [metadataName, entities] of Object.entries(entries)) {
    if (!isDefined(entities)) continue;
    const key = getMetadataFlatEntityMapsKey(metadataName as AllMetadataName);

    // The per-key value is a single per-metadata FlatEntityMaps, but the
    // outer Partial<AllFlatEntityMaps> union of those values can't be
    // inferred automatically; cast the assignment explicitly.
    (result as Record<string, FlatEntityMaps<unknown>>)[key] =
      buildFlatEntityMaps(entities);
  }

  return result as AllFlatEntityMaps;
};

const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const OWNER_APP_ID = 'owner-app-id';
const WORKSPACE_CUSTOM_APP_ID = 'workspace-custom-app-id';

const makeViewField = (overrides: {
  id: string;
  applicationId: string;
  universalIdentifier: string;
}) => ({
  ...overrides,
  fieldMetadataUniversalIdentifier: 'field-uid-1',
  viewUniversalIdentifier: 'view-uid-1',
});

describe('getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom', () => {
  it('includes entities owned by the syncing app', () => {
    const all = buildAllFlatEntityMaps({
      viewField: [
        makeViewField({
          id: 'owner-vf-1',
          applicationId: OWNER_APP_ID,
          universalIdentifier: 'owner-vf-uid-1',
        }),
      ],
    });

    const slice =
      getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom({
        ownerApplicationId: OWNER_APP_ID,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APP_ID,
        fromAllFlatEntityMaps: all,
      });

    const flatViewFieldMaps = slice[getMetadataFlatEntityMapsKey('viewField')];

    expect(
      flatViewFieldMaps?.byUniversalIdentifier['owner-vf-uid-1'],
    ).toBeDefined();
  });

  it('includes workspace-custom-owned entities for adoptable metadata types when the manifest declares them (#23192)', () => {
    const all = buildAllFlatEntityMaps({
      viewField: [
        makeViewField({
          id: 'custom-vf-1',
          applicationId: WORKSPACE_CUSTOM_APP_ID,
          universalIdentifier: 'custom-vf-uid-1',
        }),
      ],
    });

    const slice =
      getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom({
        ownerApplicationId: OWNER_APP_ID,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APP_ID,
        fromAllFlatEntityMaps: all,
        toAllUniversalFlatEntityMaps: {
          flatViewFieldMaps: {
            byUniversalIdentifier: { 'custom-vf-uid-1': {} },
          },
        } as never,
      });

    const flatViewFieldMaps = slice[getMetadataFlatEntityMapsKey('viewField')];

    // Without this, the workspace-migration dispatcher would classify the
    // matching manifest entry as a 'create' and fail with ENTITY_ALREADY_EXISTS.
    expect(
      flatViewFieldMaps?.byUniversalIdentifier['custom-vf-uid-1'],
    ).toBeDefined();
  });


  it('does NOT include workspace-custom-owned adoptable entities when the manifest does not declare them (#23192 follow-up)', () => {
    const all = buildAllFlatEntityMaps({
      viewField: [
        // A workspace-custom row that the manifest doesn't mention — e.g. a
        // label-identifier viewField the UI created.
        makeViewField({
          id: 'custom-vf-1',
          applicationId: WORKSPACE_CUSTOM_APP_ID,
          universalIdentifier: 'undeclared-vf-uid',
        }),
      ],
    });

    const slice =
      getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom({
        ownerApplicationId: OWNER_APP_ID,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APP_ID,
        fromAllFlatEntityMaps: all,
        toAllUniversalFlatEntityMaps: {
          flatViewFieldMaps: {
            byUniversalIdentifier: {
              'some-other-vf-uid': {},
            },
          },
        } as never,
      });

    const flatViewFieldMaps = slice[getMetadataFlatEntityMapsKey('viewField')];

    // The dispatcher would otherwise classify this entity as 'delete', which
    // for label-identifier rows causes INVALID_VIEW_DATA at the validator.
    expect(
      flatViewFieldMaps?.byUniversalIdentifier['undeclared-vf-uid'],
    ).toBeUndefined();
  });

  it('does NOT include workspace-custom-owned entities for non-adoptable metadata types', () => {
    const all = buildAllFlatEntityMaps({
      fieldMetadata: [
        {
          id: 'custom-fm-1',
          applicationId: WORKSPACE_CUSTOM_APP_ID,
          universalIdentifier: 'custom-fm-uid-1',
        },
      ],
    });

    const slice =
      getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom({
        ownerApplicationId: OWNER_APP_ID,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APP_ID,
        fromAllFlatEntityMaps: all,
      });

    const flatFieldMetadataMaps =
      slice[getMetadataFlatEntityMapsKey('fieldMetadata')];

    // fieldMetadata is not adoptable — strict "create conflict" path is preserved.
    expect(
      flatFieldMetadataMaps?.byUniversalIdentifier['custom-fm-uid-1'],
    ).toBeUndefined();
  });

  it('lists viewField, viewFieldGroup, viewFilter, viewSort as adoptable by default', () => {
    expect(WORKSPACE_CUSTOM_ADOPTABLE_METADATA_NAMES).toEqual([
      'viewField',
      'viewFieldGroup',
      'viewFilter',
      'viewSort',
    ]);
  });

  it('skips workspace-custom entities that already belong to the syncing app', () => {
    const all = buildAllFlatEntityMaps({
      viewField: [
        makeViewField({
          id: 'shared-vf-1',
          applicationId: OWNER_APP_ID,
          universalIdentifier: 'shared-vf-uid-1',
        }),
      ],
    });

    const slice =
      getApplicationScopedAllFlatEntityMapsForOwnerAndWorkspaceCustom({
        ownerApplicationId: OWNER_APP_ID,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APP_ID,
        fromAllFlatEntityMaps: all,
      });

    const flatViewFieldMaps = slice[getMetadataFlatEntityMapsKey('viewField')];
    const aggregators =
      flatViewFieldMaps?.universalIdentifiersByApplicationId ?? {};

    // The entity must not be double-counted under workspace-custom's appId bucket.
    expect(aggregators[WORKSPACE_CUSTOM_APP_ID]).toBeUndefined();
    expect(aggregators[OWNER_APP_ID]).toEqual(['shared-vf-uid-1']);
  });
});
