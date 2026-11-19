import { ViewKey } from 'twenty-shared/types';

import { computeMissingSuggestedViewFields } from 'src/engine/core-modules/application/application-install/utils/compute-missing-suggested-view-fields.util';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

type ComputeMissingSuggestedViewFieldsArgs = Parameters<
  typeof computeMissingSuggestedViewFields
>[0];

type FlatViewFixture = NonNullable<
  ComputeMissingSuggestedViewFieldsArgs['flatViewMaps']['byUniversalIdentifier'][string]
>;

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const OTHER_OBJECT_UNIVERSAL_IDENTIFIER =
  'b1b2b3b4-b5b6-4000-8000-000000000002';
const INDEX_VIEW_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000001';
const KANBAN_VIEW_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000002';
const FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000002';
const SUGGESTION_UNIVERSAL_IDENTIFIER = 'e1e2e3e4-e5e6-4000-8000-000000000001';

const INITIAL_VIEW_UNIVERSAL_IDENTIFIER =
  getInitialObjectViewUniversalIdentifier({
    viewApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

const buildFlatView = ({
  id,
  key = null,
  viewFieldUniversalIdentifiers = [],
  deletedAt = null,
}: {
  id: string;
  key?: FlatViewFixture['key'];
  viewFieldUniversalIdentifiers?: string[];
  deletedAt?: string | null;
}): FlatViewFixture => ({
  id,
  key,
  deletedAt,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  viewFieldUniversalIdentifiers,
});

const buildArgs = ({
  suggestedViewUniversalIdentifier = INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  initialFlatView = buildFlatView({ id: 'initial-view-id' }),
  dismissedUniversalIdentifiers = [],
  fieldObjectUniversalIdentifier = OBJECT_UNIVERSAL_IDENTIFIER,
}: {
  suggestedViewUniversalIdentifier?: string;
  initialFlatView?: FlatViewFixture | null;
  dismissedUniversalIdentifiers?: string[];
  fieldObjectUniversalIdentifier?: string;
} = {}): ComputeMissingSuggestedViewFieldsArgs => ({
  suggestedViewFieldManifests: [
    {
      universalIdentifier: SUGGESTION_UNIVERSAL_IDENTIFIER,
      viewUniversalIdentifier: suggestedViewUniversalIdentifier,
      fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
      position: 3,
    },
  ],
  dismissedUniversalIdentifiers: new Set(dismissedUniversalIdentifiers),
  workspaceCustomApplicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  flatViewMaps: {
    byUniversalIdentifier: {
      [INDEX_VIEW_UNIVERSAL_IDENTIFIER]: buildFlatView({
        id: 'index-view-id',
        key: ViewKey.INDEX,
        viewFieldUniversalIdentifiers: ['index-view-field'],
      }),
      [KANBAN_VIEW_UNIVERSAL_IDENTIFIER]: buildFlatView({
        id: 'kanban-view-id',
        viewFieldUniversalIdentifiers: ['other-kanban-view-field'],
      }),
      ...(initialFlatView === null
        ? {}
        : { [INITIAL_VIEW_UNIVERSAL_IDENTIFIER]: initialFlatView }),
    },
  },
  flatViewFieldMaps: {
    byUniversalIdentifier: {
      'index-view-field': {
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        isCanonical: true,
        deletedAt: null,
      },
      'other-kanban-view-field': {
        fieldMetadataUniversalIdentifier: OTHER_FIELD_UNIVERSAL_IDENTIFIER,
        isCanonical: true,
        deletedAt: null,
      },
      'initial-view-field': {
        fieldMetadataUniversalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
        isCanonical: true,
        deletedAt: null,
      },
    },
  },
  flatFieldMetadataMaps: {
    byUniversalIdentifier: {
      [FIELD_UNIVERSAL_IDENTIFIER]: {
        id: 'field-id',
        isActive: true,
        objectMetadataUniversalIdentifier: fieldObjectUniversalIdentifier,
      },
    },
  },
  flatObjectMetadataMaps: {
    byUniversalIdentifier: {
      [OBJECT_UNIVERSAL_IDENTIFIER]: { id: 'object-id' },
    },
  },
});

describe('computeMissingSuggestedViewFields', () => {
  it('targets the initial view for a suggestion on the INDEX view', () => {
    expect(computeMissingSuggestedViewFields(buildArgs())).toEqual([
      {
        universalIdentifier: SUGGESTION_UNIVERSAL_IDENTIFIER,
        viewId: 'initial-view-id',
        objectMetadataId: 'object-id',
        fieldMetadataId: 'field-id',
        position: 3,
      },
    ]);
  });

  it('drops an INDEX suggestion when the object has no live initial view, since INDEX already shows the field', () => {
    expect(
      computeMissingSuggestedViewFields(buildArgs({ initialFlatView: null })),
    ).toEqual([]);
    expect(
      computeMissingSuggestedViewFields(
        buildArgs({
          initialFlatView: buildFlatView({
            id: 'initial-view-id',
            deletedAt: '2026-01-01T00:00:00.000Z',
          }),
        }),
      ),
    ).toEqual([]);
  });

  it('uses any other view as declared', () => {
    expect(
      computeMissingSuggestedViewFields(
        buildArgs({
          suggestedViewUniversalIdentifier: KANBAN_VIEW_UNIVERSAL_IDENTIFIER,
        }),
      ),
    ).toEqual([expect.objectContaining({ viewId: 'kanban-view-id' })]);
  });

  it('drops a suggestion the target view already displays', () => {
    expect(
      computeMissingSuggestedViewFields(
        buildArgs({
          initialFlatView: buildFlatView({
            id: 'initial-view-id',
            viewFieldUniversalIdentifiers: ['initial-view-field'],
          }),
        }),
      ),
    ).toEqual([]);
  });

  it('drops a dismissed suggestion, one on an unknown view, and one whose field is on another object', () => {
    expect(
      computeMissingSuggestedViewFields(
        buildArgs({
          dismissedUniversalIdentifiers: [SUGGESTION_UNIVERSAL_IDENTIFIER],
        }),
      ),
    ).toEqual([]);
    expect(
      computeMissingSuggestedViewFields(
        buildArgs({
          suggestedViewUniversalIdentifier:
            'f1f2f3f4-f5f6-4000-8000-000000000001',
        }),
      ),
    ).toEqual([]);
    expect(
      computeMissingSuggestedViewFields(
        buildArgs({
          fieldObjectUniversalIdentifier: OTHER_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      ),
    ).toEqual([]);
  });
});
