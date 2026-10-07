import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { findLegacyViewObjectsToDelete } from 'src/database/commands/upgrade-version-command/2-46/utils/find-legacy-view-objects-to-delete.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const CUSTOM_APP_UID = '20202020-0000-4000-8000-000000000002';
const INSTALLED_APP_UID = '20202020-0000-4000-8000-000000000003';

const buildFlatObjectMetadata = ({
  nameSingular,
  applicationUniversalIdentifier = CUSTOM_APP_UID,
}: {
  nameSingular: string;
  applicationUniversalIdentifier?: string;
}) =>
  getFlatObjectMetadataMock({
    id: `object-${nameSingular}`,
    universalIdentifier: `object-uid-${nameSingular}`,
    applicationUniversalIdentifier,
    nameSingular,
    namePlural: `${nameSingular}s`,
  });

const buildRelationFlatFieldMetadata = ({
  name,
  objectNameSingular,
  targetObjectNameSingular,
  type = FieldMetadataType.RELATION,
}: {
  name: string;
  objectNameSingular: string;
  targetObjectNameSingular: string;
  type?: FieldMetadataType;
}) =>
  getFlatFieldMetadataMock({
    id: `field-${objectNameSingular}-${name}`,
    universalIdentifier: `field-uid-${objectNameSingular}-${name}`,
    objectMetadataId: `object-${objectNameSingular}`,
    name,
    type,
    relationTargetObjectMetadataId: `object-${targetObjectNameSingular}`,
  });

const toFlatEntityMaps = <
  TFlatEntity extends FlatObjectMetadata | FlatFieldMetadata,
>(
  flatEntities: TFlatEntity[],
) =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const findToDelete = ({
  flatObjectMetadatas,
  flatFieldMetadatas = [],
  existingTableNames,
}: {
  flatObjectMetadatas: FlatObjectMetadata[];
  flatFieldMetadatas?: FlatFieldMetadata[];
  existingTableNames: string[];
}) => {
  const result = findLegacyViewObjectsToDelete({
    flatObjectMetadataMaps: toFlatEntityMaps(flatObjectMetadatas),
    flatFieldMetadataMaps: toFlatEntityMaps(flatFieldMetadatas),
    existingTableNames: new Set(existingTableNames),
    workspaceCustomApplicationUniversalIdentifier: CUSTOM_APP_UID,
  });

  return {
    deleted: result.flatObjectMetadatasToDelete.map(
      ({ nameSingular }) => nameSingular,
    ),
    inverseFields: result.inverseFlatFieldMetadatasToDelete.map(
      ({ id }) => id,
    ),
    kept: result.keptFlatObjectMetadatas.map(
      ({ flatObjectMetadata, reason }) =>
        `${flatObjectMetadata.nameSingular}: ${reason}`,
    ),
  };
};

describe('findLegacyViewObjectsToDelete', () => {
  it('deletes the legacy view objects whose prefixed table does not exist', () => {
    expect(
      findToDelete({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({ nameSingular: 'view' }),
          buildFlatObjectMetadata({ nameSingular: 'viewField' }),
          buildFlatObjectMetadata({ nameSingular: 'viewFilterGroup' }),
        ],
        existingTableNames: ['viewField'],
      }),
    ).toEqual({
      deleted: ['view', 'viewField', 'viewFilterGroup'],
      inverseFields: [],
      kept: [],
    });
  });

  it('never touches an object with another name, even without a table', () => {
    expect(
      findToDelete({
        flatObjectMetadatas: [buildFlatObjectMetadata({ nameSingular: 'pet' })],
        existingTableNames: [],
      }),
    ).toEqual({ deleted: [], inverseFields: [], kept: [] });
  });

  it('keeps a custom object named like a legacy view object when its table exists', () => {
    expect(
      findToDelete({
        flatObjectMetadatas: [buildFlatObjectMetadata({ nameSingular: 'view' })],
        existingTableNames: ['_view'],
      }),
    ).toEqual({
      deleted: [],
      inverseFields: [],
      kept: ['view: table "_view" exists'],
    });
  });

  it('keeps legacy-named objects of other applications', () => {
    expect(
      findToDelete({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({
            nameSingular: 'viewSort',
            applicationUniversalIdentifier: INSTALLED_APP_UID,
          }),
        ],
        existingTableNames: [],
      }),
    ).toEqual({
      deleted: [],
      inverseFields: [],
      kept: [`viewSort: owned by application ${INSTALLED_APP_UID}`],
    });
  });

  it('deletes the relation fields that surviving objects hold on a deleted object', () => {
    expect(
      findToDelete({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({ nameSingular: 'view' }),
          buildFlatObjectMetadata({ nameSingular: 'viewField' }),
          buildFlatObjectMetadata({ nameSingular: 'pet' }),
          buildFlatObjectMetadata({
            nameSingular: 'timelineActivity',
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          }),
        ],
        flatFieldMetadatas: [
          buildRelationFlatFieldMetadata({
            name: 'view',
            objectNameSingular: 'viewField',
            targetObjectNameSingular: 'view',
          }),
          buildRelationFlatFieldMetadata({
            name: 'viewFields',
            objectNameSingular: 'view',
            targetObjectNameSingular: 'viewField',
          }),
          buildRelationFlatFieldMetadata({
            name: 'favoriteViewField',
            objectNameSingular: 'pet',
            targetObjectNameSingular: 'viewField',
          }),
          buildRelationFlatFieldMetadata({
            name: 'targetView',
            objectNameSingular: 'timelineActivity',
            targetObjectNameSingular: 'view',
            type: FieldMetadataType.MORPH_RELATION,
          }),
          buildRelationFlatFieldMetadata({
            name: 'targetPet',
            objectNameSingular: 'timelineActivity',
            targetObjectNameSingular: 'pet',
            type: FieldMetadataType.MORPH_RELATION,
          }),
        ],
        existingTableNames: ['_pet', 'timelineActivity'],
      }),
    ).toEqual({
      deleted: ['view', 'viewField'],
      inverseFields: [
        'field-pet-favoriteViewField',
        'field-timelineActivity-targetView',
      ],
      kept: [],
    });
  });
});
