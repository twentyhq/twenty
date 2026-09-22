import { FieldMetadataType } from 'twenty-shared/types';

import { computeSchemaScopeApplicationIds } from 'src/engine/api/graphql/workspace-graphql-schema-sdl/utils/compute-schema-scope-application-ids.util';
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
const UNRELATED_APP_ID = 'unrelated-app-id';

const buildObject = (applicationId: string) =>
  getFlatObjectMetadataMock({
    id: `${applicationId}-object-id`,
    universalIdentifier: `${applicationId}-object-universal-identifier`,
    applicationId,
  });

const buildRelationField = ({
  applicationId,
  sourceObject,
  targetObject,
}: {
  applicationId: string;
  sourceObject: FlatObjectMetadata;
  targetObject: FlatObjectMetadata;
}) =>
  getFlatFieldMetadataMock({
    id: `${applicationId}-${sourceObject.id}-${targetObject.id}`,
    universalIdentifier: `${applicationId}-${sourceObject.id}-${targetObject.id}-universal-identifier`,
    type: FieldMetadataType.RELATION,
    applicationId,
    objectMetadataId: sourceObject.id,
    relationTargetObjectMetadataId: targetObject.id,
  });

const buildMaps = ({
  objects,
  fields,
}: {
  objects: FlatObjectMetadata[];
  fields: FlatFieldMetadata[];
}) => ({
  flatObjectMetadataMaps: objects.reduce<FlatEntityMaps<FlatObjectMetadata>>(
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

describe('computeSchemaScopeApplicationIds', () => {
  const standardObject = buildObject(STANDARD_APPLICATION_ID);
  const appAObject = buildObject(APP_A_ID);
  const appBObject = buildObject(APP_B_ID);
  const appCObject = buildObject(APP_C_ID);
  const unrelatedAppObject = buildObject(UNRELATED_APP_ID);

  it('should keep initial application ids when relations stay in scope', () => {
    const result = computeSchemaScopeApplicationIds({
      initialApplicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: [standardObject, appBObject, unrelatedAppObject],
        fields: [
          buildRelationField({
            applicationId: APP_B_ID,
            sourceObject: appBObject,
            targetObject: standardObject,
          }),
        ],
      }),
    });

    expect(result.sort()).toEqual([APP_B_ID, STANDARD_APPLICATION_ID].sort());
  });

  it('should include the application owning a relation target object', () => {
    const result = computeSchemaScopeApplicationIds({
      initialApplicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: [standardObject, appAObject, appBObject, unrelatedAppObject],
        fields: [
          buildRelationField({
            applicationId: APP_B_ID,
            sourceObject: appBObject,
            targetObject: appAObject,
          }),
          buildRelationField({
            applicationId: APP_B_ID,
            sourceObject: appAObject,
            targetObject: appBObject,
          }),
        ],
      }),
    });

    expect(result.sort()).toEqual(
      [APP_A_ID, APP_B_ID, STANDARD_APPLICATION_ID].sort(),
    );
  });

  it('should include applications targeted from a standard object field owned by the app', () => {
    const result = computeSchemaScopeApplicationIds({
      initialApplicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: [standardObject, appAObject, appBObject],
        fields: [
          buildRelationField({
            applicationId: APP_B_ID,
            sourceObject: standardObject,
            targetObject: appAObject,
          }),
        ],
      }),
    });

    expect(result.sort()).toEqual(
      [APP_A_ID, APP_B_ID, STANDARD_APPLICATION_ID].sort(),
    );
  });

  it('should follow relations of newly included applications', () => {
    const result = computeSchemaScopeApplicationIds({
      initialApplicationIds: [STANDARD_APPLICATION_ID, APP_B_ID],
      ...buildMaps({
        objects: [
          standardObject,
          appAObject,
          appBObject,
          appCObject,
          unrelatedAppObject,
        ],
        fields: [
          buildRelationField({
            applicationId: APP_B_ID,
            sourceObject: appBObject,
            targetObject: appAObject,
          }),
          buildRelationField({
            applicationId: APP_A_ID,
            sourceObject: appAObject,
            targetObject: appCObject,
          }),
        ],
      }),
    });

    expect(result.sort()).toEqual(
      [APP_A_ID, APP_B_ID, APP_C_ID, STANDARD_APPLICATION_ID].sort(),
    );
  });
});
