import { FieldMetadataType } from 'twenty-shared/types';

import { computeSchemaScopeFlatEntityIds } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/compute-schema-scope-flat-entity-ids.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const STANDARD_APPLICATION_ID = 'standard-application-id';
const APP_A_ID = 'app-a-id';
const APP_B_ID = 'app-b-id';
const APP_C_ID = 'app-c-id';

const buildField = ({
  id,
  applicationId,
  objectMetadataId,
  relationTargetObjectMetadataId = null,
}: {
  id: string;
  applicationId: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId?: string | null;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    type: isRelation(relationTargetObjectMetadataId)
      ? FieldMetadataType.RELATION
      : FieldMetadataType.TEXT,
    applicationId,
    objectMetadataId,
    relationTargetObjectMetadataId,
  });

const isRelation = (relationTargetObjectMetadataId: string | null) =>
  relationTargetObjectMetadataId !== null;

const buildObject = ({
  id,
  applicationId,
  fields,
}: {
  id: string;
  applicationId: string;
  fields: FlatFieldMetadata[];
}) =>
  getFlatObjectMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    applicationId,
    fieldIds: fields
      .filter((field) => field.objectMetadataId === id)
      .map((field) => field.id),
  });

const buildMaps = ({
  objects,
  fields,
}: {
  objects: { id: string; applicationId: string }[];
  fields: FlatFieldMetadata[];
}) => ({
  flatObjectMetadataMaps: objects
    .map((object) => buildObject({ ...object, fields }))
    .reduce<FlatEntityMaps<FlatObjectMetadata>>(
      (flatEntityMaps, flatEntity) =>
        addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
      createEmptyFlatEntityMaps(),
    ),
  flatFieldMetadataMaps: fields.reduce<FlatEntityMaps<FlatFieldMetadata>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  ),
});

const OBJECTS = [
  { id: 'standard-object', applicationId: STANDARD_APPLICATION_ID },
  { id: 'app-a-object', applicationId: APP_A_ID },
  { id: 'app-a-other-object', applicationId: APP_A_ID },
  { id: 'app-b-object', applicationId: APP_B_ID },
  { id: 'app-c-object', applicationId: APP_C_ID },
];

const APP_A_FIELDS = [
  buildField({
    id: 'app-a-name',
    applicationId: APP_A_ID,
    objectMetadataId: 'app-a-object',
  }),
  buildField({
    id: 'app-a-other-name',
    applicationId: APP_A_ID,
    objectMetadataId: 'app-a-other-object',
  }),
];

const APP_C_FIELDS = [
  buildField({
    id: 'app-c-name',
    applicationId: APP_C_ID,
    objectMetadataId: 'app-c-object',
  }),
  buildField({
    id: 'app-c-field-on-app-a-object',
    applicationId: APP_C_ID,
    objectMetadataId: 'app-a-object',
  }),
];

describe('computeSchemaScopeFlatEntityIds', () => {
  it('should only keep entities of the given applications when relations stay in scope', () => {
    const result = computeSchemaScopeFlatEntityIds({
      applicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: OBJECTS,
        fields: [
          ...APP_A_FIELDS,
          buildField({
            id: 'app-b-to-standard',
            applicationId: APP_B_ID,
            objectMetadataId: 'app-b-object',
            relationTargetObjectMetadataId: 'standard-object',
          }),
        ],
      }),
    });

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      ['app-b-object', 'standard-object'].sort(),
    );
    expect(result.flatFieldMetadataIds).toEqual(['app-b-to-standard']);
  });

  it('should include the relation target object with its owner fields only', () => {
    const result = computeSchemaScopeFlatEntityIds({
      applicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: OBJECTS,
        fields: [
          ...APP_A_FIELDS,
          ...APP_C_FIELDS,
          buildField({
            id: 'app-b-to-app-a',
            applicationId: APP_B_ID,
            objectMetadataId: 'app-b-object',
            relationTargetObjectMetadataId: 'app-a-object',
          }),
          buildField({
            id: 'app-a-to-app-b',
            applicationId: APP_B_ID,
            objectMetadataId: 'app-a-object',
            relationTargetObjectMetadataId: 'app-b-object',
          }),
        ],
      }),
    });

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      ['app-a-object', 'app-b-object', 'standard-object'].sort(),
    );
    expect(result.flatFieldMetadataIds.sort()).toEqual(
      ['app-a-name', 'app-a-to-app-b', 'app-b-to-app-a'].sort(),
    );
  });

  it('should include targets of app fields declared on standard objects', () => {
    const result = computeSchemaScopeFlatEntityIds({
      applicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: OBJECTS,
        fields: [
          ...APP_A_FIELDS,
          buildField({
            id: 'standard-to-app-a',
            applicationId: APP_B_ID,
            objectMetadataId: 'standard-object',
            relationTargetObjectMetadataId: 'app-a-object',
          }),
        ],
      }),
    });

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      ['app-a-object', 'app-b-object', 'standard-object'].sort(),
    );
    expect(result.flatFieldMetadataIds.sort()).toEqual(
      ['app-a-name', 'standard-to-app-a'].sort(),
    );
  });

  it('should follow relations of included target objects', () => {
    const result = computeSchemaScopeFlatEntityIds({
      applicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: OBJECTS,
        fields: [
          ...APP_A_FIELDS,
          ...APP_C_FIELDS,
          buildField({
            id: 'app-b-to-app-a',
            applicationId: APP_B_ID,
            objectMetadataId: 'app-b-object',
            relationTargetObjectMetadataId: 'app-a-object',
          }),
          buildField({
            id: 'app-a-to-app-c',
            applicationId: APP_A_ID,
            objectMetadataId: 'app-a-object',
            relationTargetObjectMetadataId: 'app-c-object',
          }),
        ],
      }),
    });

    expect(result.flatObjectMetadataIds.sort()).toEqual(
      [
        'app-a-object',
        'app-b-object',
        'app-c-object',
        'standard-object',
      ].sort(),
    );
    expect(result.flatFieldMetadataIds.sort()).toEqual(
      ['app-a-name', 'app-a-to-app-c', 'app-b-to-app-a', 'app-c-name'].sort(),
    );
  });
});
