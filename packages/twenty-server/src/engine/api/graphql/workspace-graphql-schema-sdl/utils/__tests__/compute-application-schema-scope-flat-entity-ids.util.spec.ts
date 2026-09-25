import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeApplicationSchemaScopeFlatEntityIds } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/compute-application-schema-scope-flat-entity-ids.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const STANDARD_APPLICATION_ID = 'standard-application-id';
const APP_A_ID = 'app-a-id';
const APP_B_ID = 'app-b-id';
const APP_C_ID = 'app-c-id';

const STANDARD_OBJECT_ID = 'standard-object';
const APP_A_OBJECT_ID = 'app-a-object';
const APP_A_OTHER_OBJECT_ID = 'app-a-other-object';
const APP_B_OBJECT_ID = 'app-b-object';
const APP_C_OBJECT_ID = 'app-c-object';

type ObjectFixture = { id: string; applicationId: string };

const OBJECTS: ObjectFixture[] = [
  { id: STANDARD_OBJECT_ID, applicationId: STANDARD_APPLICATION_ID },
  { id: APP_A_OBJECT_ID, applicationId: APP_A_ID },
  { id: APP_A_OTHER_OBJECT_ID, applicationId: APP_A_ID },
  { id: APP_B_OBJECT_ID, applicationId: APP_B_ID },
  { id: APP_C_OBJECT_ID, applicationId: APP_C_ID },
];

const buildField = ({
  id,
  applicationId,
  objectMetadataId,
  relationTargetObjectMetadataId,
}: {
  id: string;
  applicationId: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId?: string;
}): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    type: isDefined(relationTargetObjectMetadataId)
      ? FieldMetadataType.RELATION
      : FieldMetadataType.TEXT,
    applicationId,
    objectMetadataId,
    relationTargetObjectMetadataId: relationTargetObjectMetadataId ?? null,
  });

const buildIndex = ({
  id,
  applicationId,
  objectMetadataId,
}: {
  id: string;
  applicationId: string;
  objectMetadataId: string;
}): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    applicationId,
    applicationUniversalIdentifier: `${applicationId}-universal-identifier`,
    objectMetadataId,
    objectMetadataUniversalIdentifier: `${objectMetadataId}-universal-identifier`,
  });

const buildFlatEntityMaps = <T extends SyncableFlatEntity>(
  flatEntities: T[],
): FlatEntityMaps<T> =>
  flatEntities.reduce<FlatEntityMaps<T>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildMaps = ({
  fields,
  indexes = [],
}: {
  fields: FlatFieldMetadata[];
  indexes?: FlatIndexMetadata[];
}) => ({
  flatObjectMetadataMaps: buildFlatEntityMaps<FlatObjectMetadata>(
    OBJECTS.map(({ id, applicationId }) =>
      getFlatObjectMetadataMock({
        id,
        universalIdentifier: `${id}-universal-identifier`,
        applicationId,
        fieldIds: fields
          .filter((field) => field.objectMetadataId === id)
          .map((field) => field.id),
        indexMetadataIds: indexes
          .filter((index) => index.objectMetadataId === id)
          .map((index) => index.id),
      }),
    ),
  ),
  flatFieldMetadataMaps: buildFlatEntityMaps(fields),
  flatIndexMaps: buildFlatEntityMaps(indexes),
});

const APP_A_NAME_FIELD = buildField({
  id: 'app-a-name',
  applicationId: APP_A_ID,
  objectMetadataId: APP_A_OBJECT_ID,
});

const APP_A_OTHER_NAME_FIELD = buildField({
  id: 'app-a-other-name',
  applicationId: APP_A_ID,
  objectMetadataId: APP_A_OTHER_OBJECT_ID,
});

const APP_C_FIELD_ON_APP_A_OBJECT = buildField({
  id: 'app-c-field-on-app-a-object',
  applicationId: APP_C_ID,
  objectMetadataId: APP_A_OBJECT_ID,
});

const APP_C_NAME_FIELD = buildField({
  id: 'app-c-name',
  applicationId: APP_C_ID,
  objectMetadataId: APP_C_OBJECT_ID,
});

const APP_B_TO_APP_A_FIELD = buildField({
  id: 'app-b-to-app-a',
  applicationId: APP_B_ID,
  objectMetadataId: APP_B_OBJECT_ID,
  relationTargetObjectMetadataId: APP_A_OBJECT_ID,
});

const APP_B_INVERSE_ON_APP_A_OBJECT_FIELD = buildField({
  id: 'app-b-inverse-on-app-a-object',
  applicationId: APP_B_ID,
  objectMetadataId: APP_A_OBJECT_ID,
  relationTargetObjectMetadataId: APP_B_OBJECT_ID,
});

const computeForAppB = (
  maps: ReturnType<typeof buildMaps>,
): ReturnType<typeof computeApplicationSchemaScopeFlatEntityIds> =>
  computeApplicationSchemaScopeFlatEntityIds({
    applicationId: APP_B_ID,
    twentyStandardApplicationId: STANDARD_APPLICATION_ID,
    ...maps,
  });

describe('computeApplicationSchemaScopeFlatEntityIds', () => {
  it('keeps the standard and requesting application entities when no relation leaves the scope', () => {
    const result = computeForAppB(
      buildMaps({
        fields: [
          APP_A_NAME_FIELD,
          buildField({
            id: 'app-b-to-standard',
            applicationId: APP_B_ID,
            objectMetadataId: APP_B_OBJECT_ID,
            relationTargetObjectMetadataId: STANDARD_OBJECT_ID,
          }),
        ],
      }),
    );

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      [APP_B_OBJECT_ID, STANDARD_OBJECT_ID].sort(),
    );
    expect(result.flatFieldMetadataIds).toEqual(['app-b-to-standard']);
    expect(result.flatIndexMetadataIds).toEqual([]);
  });

  it('pulls in a relation target object with the fields its own application defines on it', () => {
    const result = computeForAppB(
      buildMaps({
        fields: [
          APP_A_NAME_FIELD,
          APP_A_OTHER_NAME_FIELD,
          APP_C_FIELD_ON_APP_A_OBJECT,
          APP_B_TO_APP_A_FIELD,
          APP_B_INVERSE_ON_APP_A_OBJECT_FIELD,
        ],
      }),
    );

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      [APP_A_OBJECT_ID, APP_B_OBJECT_ID, STANDARD_OBJECT_ID].sort(),
    );
    expect(result.flatFieldMetadataIds.sort()).toEqual(
      ['app-a-name', 'app-b-inverse-on-app-a-object', 'app-b-to-app-a'].sort(),
    );
  });

  it('follows a relation the requesting application declares on a standard object', () => {
    const result = computeForAppB(
      buildMaps({
        fields: [
          APP_A_NAME_FIELD,
          buildField({
            id: 'standard-to-app-a',
            applicationId: APP_B_ID,
            objectMetadataId: STANDARD_OBJECT_ID,
            relationTargetObjectMetadataId: APP_A_OBJECT_ID,
          }),
        ],
      }),
    );

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      [APP_A_OBJECT_ID, APP_B_OBJECT_ID, STANDARD_OBJECT_ID].sort(),
    );
    expect(result.flatFieldMetadataIds.sort()).toEqual(
      ['app-a-name', 'standard-to-app-a'].sort(),
    );
  });

  it('follows the relations of pulled-in objects transitively', () => {
    const result = computeForAppB(
      buildMaps({
        fields: [
          APP_A_NAME_FIELD,
          APP_C_NAME_FIELD,
          APP_B_TO_APP_A_FIELD,
          buildField({
            id: 'app-a-to-app-c',
            applicationId: APP_A_ID,
            objectMetadataId: APP_A_OBJECT_ID,
            relationTargetObjectMetadataId: APP_C_OBJECT_ID,
          }),
        ],
      }),
    );

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      [
        APP_A_OBJECT_ID,
        APP_B_OBJECT_ID,
        APP_C_OBJECT_ID,
        STANDARD_OBJECT_ID,
      ].sort(),
    );
    expect(result.flatFieldMetadataIds.sort()).toEqual(
      ['app-a-name', 'app-a-to-app-c', 'app-b-to-app-a', 'app-c-name'].sort(),
    );
  });

  it('seeds the walk from the requesting application relations only', () => {
    const result = computeForAppB(
      buildMaps({
        fields: [
          APP_C_NAME_FIELD,
          buildField({
            id: 'standard-owned-to-app-c',
            applicationId: STANDARD_APPLICATION_ID,
            objectMetadataId: STANDARD_OBJECT_ID,
            relationTargetObjectMetadataId: APP_C_OBJECT_ID,
          }),
        ],
      }),
    );

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      [APP_B_OBJECT_ID, STANDARD_OBJECT_ID].sort(),
    );
    expect(result.flatFieldMetadataIds).toEqual(['standard-owned-to-app-c']);
  });

  it('selects the indexes of each in-scope object owned by the scope or by the object application', () => {
    const result = computeForAppB(
      buildMaps({
        fields: [APP_A_NAME_FIELD, APP_B_TO_APP_A_FIELD],
        indexes: [
          buildIndex({
            id: 'standard-index',
            applicationId: STANDARD_APPLICATION_ID,
            objectMetadataId: STANDARD_OBJECT_ID,
          }),
          buildIndex({
            id: 'app-b-index-on-standard-object',
            applicationId: APP_B_ID,
            objectMetadataId: STANDARD_OBJECT_ID,
          }),
          buildIndex({
            id: 'app-c-index-on-standard-object',
            applicationId: APP_C_ID,
            objectMetadataId: STANDARD_OBJECT_ID,
          }),
          buildIndex({
            id: 'app-a-index',
            applicationId: APP_A_ID,
            objectMetadataId: APP_A_OBJECT_ID,
          }),
          buildIndex({
            id: 'app-c-index-on-app-a-object',
            applicationId: APP_C_ID,
            objectMetadataId: APP_A_OBJECT_ID,
          }),
          buildIndex({
            id: 'app-c-index',
            applicationId: APP_C_ID,
            objectMetadataId: APP_C_OBJECT_ID,
          }),
        ],
      }),
    );

    expect(result.flatIndexMetadataIds.sort()).toEqual(
      [
        'app-a-index',
        'app-b-index-on-standard-object',
        'standard-index',
      ].sort(),
    );
  });
});
