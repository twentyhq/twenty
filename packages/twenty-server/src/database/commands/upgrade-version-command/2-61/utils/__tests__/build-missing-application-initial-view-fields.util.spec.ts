import {
  getSystemViewFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';

import { buildMissingApplicationInitialViewFields } from 'src/database/commands/upgrade-version-command/2-61/utils/build-missing-application-initial-view-fields.util';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

type BuildMissingApplicationInitialViewFieldsArgs = Parameters<
  typeof buildMissingApplicationInitialViewFields
>[0];

type FlatViewFieldFixture = NonNullable<
  BuildMissingApplicationInitialViewFieldsArgs['flatViewFieldMaps']['byUniversalIdentifier'][string]
> & { universalIdentifier: string };

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

const buildIndexFlatViewField = ({
  fieldMetadataUniversalIdentifier,
  position,
}: {
  fieldMetadataUniversalIdentifier: string;
  position: number;
}): FlatViewFieldFixture => ({
  universalIdentifier: `index-${fieldMetadataUniversalIdentifier}`,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  universalOverrides: null,
  fieldMetadataUniversalIdentifier,
  position,
  isSystemSideEffect: true,
  isCanonical: true,
  deletedAt: null,
});

const buildInitialFlatViewField = ({
  fieldMetadataUniversalIdentifier,
  position,
  overrides = {},
}: {
  fieldMetadataUniversalIdentifier: string;
  position: number;
  overrides?: Partial<FlatViewFieldFixture>;
}): FlatViewFieldFixture => ({
  universalIdentifier: `initial-${fieldMetadataUniversalIdentifier}`,
  applicationUniversalIdentifier:
    WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
  universalOverrides: null,
  fieldMetadataUniversalIdentifier,
  position,
  isSystemSideEffect: false,
  isCanonical: true,
  deletedAt: null,
  ...overrides,
});

const INDEX_FLAT_VIEW_FIELDS = [
  buildIndexFlatViewField({
    fieldMetadataUniversalIdentifier: STANDARD_FIELD_UNIVERSAL_IDENTIFIER,
    position: 0,
  }),
  buildIndexFlatViewField({
    fieldMetadataUniversalIdentifier: USER_FIELD_UNIVERSAL_IDENTIFIER,
    position: 1,
  }),
  buildIndexFlatViewField({
    fieldMetadataUniversalIdentifier:
      SECOND_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
    position: 3,
  }),
  buildIndexFlatViewField({
    fieldMetadataUniversalIdentifier:
      FIRST_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
    position: 2,
  }),
];

const buildArgs = ({
  initialFlatViewFields = [
    buildInitialFlatViewField({
      fieldMetadataUniversalIdentifier: STANDARD_FIELD_UNIVERSAL_IDENTIFIER,
      position: 0,
    }),
  ],
  initialFlatViewDeletedAt = null,
}: {
  initialFlatViewFields?: FlatViewFieldFixture[];
  initialFlatViewDeletedAt?: string | null;
} = {}): BuildMissingApplicationInitialViewFieldsArgs => {
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
      deletedAt: initialFlatViewDeletedAt,
      viewFieldUniversalIdentifiers: initialFlatViewFields.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    },
  ];

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
    },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: Object.fromEntries(
        Object.entries(
          APPLICATION_UNIVERSAL_IDENTIFIER_BY_FIELD_UNIVERSAL_IDENTIFIER,
        ).map(([universalIdentifier, applicationUniversalIdentifier]) => [
          universalIdentifier,
          { applicationUniversalIdentifier },
        ]),
      ),
    },
    flatViewMaps: {
      byUniversalIdentifier: Object.fromEntries(
        flatViews.map((flatView) => [flatView.universalIdentifier, flatView]),
      ),
    },
    flatViewFieldMaps: {
      byUniversalIdentifier: Object.fromEntries(
        [...INDEX_FLAT_VIEW_FIELDS, ...initialFlatViewFields].map(
          (flatViewField) => [flatViewField.universalIdentifier, flatViewField],
        ),
      ),
    },
    twentyStandardApplicationUniversalIdentifier:
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    now: NOW,
  };
};

describe('buildMissingApplicationInitialViewFields', () => {
  it('should append the application fields of the INDEX view in INDEX order', () => {
    const result = buildMissingApplicationInitialViewFields(buildArgs());

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

  it('should append after a column the user moved to the end', () => {
    const result = buildMissingApplicationInitialViewFields(
      buildArgs({
        initialFlatViewFields: [
          buildInitialFlatViewField({
            fieldMetadataUniversalIdentifier:
              STANDARD_FIELD_UNIVERSAL_IDENTIFIER,
            position: 0,
            overrides: {
              universalOverrides: {
                [WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER]: {
                  position: 20,
                },
              },
            },
          }),
        ],
      }),
    );

    expect(
      result
        .get(INSTALLED_APPLICATION_UNIVERSAL_IDENTIFIER)
        ?.map(({ position }) => position),
    ).toEqual([21, 22]);
  });

  it('should skip a field the initial view already displays or whose column was removed', () => {
    const result = buildMissingApplicationInitialViewFields(
      buildArgs({
        initialFlatViewFields: [
          buildInitialFlatViewField({
            fieldMetadataUniversalIdentifier:
              FIRST_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
            position: 0,
          }),
          buildInitialFlatViewField({
            fieldMetadataUniversalIdentifier:
              SECOND_APPLICATION_FIELD_UNIVERSAL_IDENTIFIER,
            position: 1,
            overrides: { deletedAt: '2026-10-01T00:00:00.000Z' },
          }),
        ],
      }),
    );

    expect(result.size).toBe(0);
  });

  it('should skip an object without a live initial view', () => {
    const result = buildMissingApplicationInitialViewFields(
      buildArgs({ initialFlatViewDeletedAt: '2026-10-01T00:00:00.000Z' }),
    );

    expect(result.size).toBe(0);
  });
});
