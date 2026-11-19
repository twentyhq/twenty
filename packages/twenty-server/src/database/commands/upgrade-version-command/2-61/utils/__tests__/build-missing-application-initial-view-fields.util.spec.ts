import {
  getSystemViewFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { buildMissingApplicationInitialViewFields } from 'src/database/commands/upgrade-version-command/2-61/utils/build-missing-application-initial-view-fields.util';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { type FlatViewFieldMaps } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field-maps.type';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

const NOW = '2026-11-18T12:00:00.000Z';

const INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  'a1a2a3a4-a5a6-4000-8000-000000000002';
const OBJECT_UNIVERSAL_IDENTIFIER = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const INDEX_VIEW_UNIVERSAL_IDENTIFIER = 'd1d2d3d4-d5d6-4000-8000-000000000001';
const STANDARD_FIELD_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000001';
const USER_FIELD_UNIVERSAL_IDENTIFIER = 'c1c2c3c4-c5c6-4000-8000-000000000002';
const FIRST_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000003';
const SECOND_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER =
  'c1c2c3c4-c5c6-4000-8000-000000000004';

const INITIAL_VIEW_UNIVERSAL_IDENTIFIER =
  getInitialObjectViewUniversalIdentifier({
    viewApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  });

const APPLICATION_UNIVERSAL_IDENTIFIER_BY_FIELD_UNIVERSAL_IDENTIFIER = {
  [STANDARD_FIELD_UNIVERSAL_IDENTIFIER]:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  [USER_FIELD_UNIVERSAL_IDENTIFIER]:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  [FIRST_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER]:
    INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
  [SECOND_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER]:
    INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
};

const buildIndexFlatViewField = (
  fieldMetadataUniversalIdentifier: string,
  position: number,
) =>
  ({
    universalIdentifier: `index-${fieldMetadataUniversalIdentifier}`,
    fieldMetadataUniversalIdentifier,
    position,
    isSystemSideEffect: true,
    isCanonical: true,
    deletedAt: null,
  }) as FlatViewField;

const buildInitialFlatViewField = (
  fieldMetadataUniversalIdentifier: string,
  position: number,
  overrides: Partial<FlatViewField> = {},
) =>
  ({
    universalIdentifier: `initial-${fieldMetadataUniversalIdentifier}`,
    fieldMetadataUniversalIdentifier,
    position,
    isSystemSideEffect: false,
    isCanonical: true,
    deletedAt: null,
    ...overrides,
  }) as FlatViewField;

const INDEX_FLAT_VIEW_FIELDS = [
  buildIndexFlatViewField(STANDARD_FIELD_UNIVERSAL_IDENTIFIER, 0),
  buildIndexFlatViewField(USER_FIELD_UNIVERSAL_IDENTIFIER, 1),
  buildIndexFlatViewField(SECOND_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER, 3),
  buildIndexFlatViewField(FIRST_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER, 2),
];

const buildMaps = ({
  initialFlatViewFields = [
    buildInitialFlatViewField(STANDARD_FIELD_UNIVERSAL_IDENTIFIER, 0),
  ],
  initialFlatViewOverrides = {},
}: {
  initialFlatViewFields?: FlatViewField[];
  initialFlatViewOverrides?: Partial<FlatView>;
} = {}) => {
  const flatViews = [
    {
      universalIdentifier: INDEX_VIEW_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
      key: ViewKey.INDEX,
      deletedAt: null,
      viewFieldUniversalIdentifiers: INDEX_FLAT_VIEW_FIELDS.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    },
    {
      universalIdentifier: INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      key: null,
      deletedAt: null,
      viewFieldUniversalIdentifiers: initialFlatViewFields.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
      ...initialFlatViewOverrides,
    },
  ] as FlatView[];

  return {
    flatObjectMetadataMaps: {
      byUniversalIdentifier: {
        [OBJECT_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifiers: flatViews.map(
            ({ universalIdentifier }) => universalIdentifier,
          ),
        },
      },
    } as unknown as FlatObjectMetadataMaps,
    flatFieldMetadataMaps: {
      byUniversalIdentifier: Object.fromEntries(
        Object.entries(
          APPLICATION_UNIVERSAL_IDENTIFIER_BY_FIELD_UNIVERSAL_IDENTIFIER,
        ).map(([universalIdentifier, applicationUniversalIdentifier]) => [
          universalIdentifier,
          { universalIdentifier, applicationUniversalIdentifier },
        ]),
      ) as Record<string, FlatFieldMetadata>,
    } as FlatFieldMetadataMaps,
    flatViewMaps: {
      byUniversalIdentifier: Object.fromEntries(
        flatViews.map((flatView) => [flatView.universalIdentifier, flatView]),
      ),
    } as FlatViewMaps,
    flatViewFieldMaps: {
      byUniversalIdentifier: Object.fromEntries(
        [...INDEX_FLAT_VIEW_FIELDS, ...initialFlatViewFields].map(
          (flatViewField) => [flatViewField.universalIdentifier, flatViewField],
        ),
      ),
    } as FlatViewFieldMaps,
    twentyStandardApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  };
};

describe('buildMissingApplicationInitialViewFields', () => {
  it('should append the application fields of the INDEX view in INDEX order', () => {
    const result = buildMissingApplicationInitialViewFields(buildMaps());

    expect([...result.keys()]).toEqual([
      INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
    ]);
    expect(result.get(INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER)).toEqual(
      [
        FIRST_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
        SECOND_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
      ].map((fieldMetadataUniversalIdentifier, index) =>
        expect.objectContaining({
          universalIdentifier: getSystemViewFieldUniversalIdentifier({
            fieldMetadataApplicationUniversalIdentifier:
              INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
            viewUniversalIdentifier: INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
            fieldMetadataUniversalIdentifier,
          }),
          applicationUniversalIdentifier:
            INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifier: INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
          fieldMetadataUniversalIdentifier,
          position: index + 1,
          isVisible: true,
          isSystemSideEffect: true,
        }),
      ),
    );
  });

  it('should skip a field the initial view already displays or whose column was removed', () => {
    const result = buildMissingApplicationInitialViewFields(
      buildMaps({
        initialFlatViewFields: [
          buildInitialFlatViewField(
            FIRST_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
            0,
          ),
          buildInitialFlatViewField(
            SECOND_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
            1,
            { deletedAt: '2026-10-01T00:00:00.000Z' },
          ),
        ],
      }),
    );

    expect(result.size).toBe(0);
  });

  it('should skip an object without a live initial view', () => {
    const result = buildMissingApplicationInitialViewFields(
      buildMaps({
        initialFlatViewOverrides: { deletedAt: '2026-10-01T00:00:00.000Z' },
      }),
    );

    expect(result.size).toBe(0);
  });
});
