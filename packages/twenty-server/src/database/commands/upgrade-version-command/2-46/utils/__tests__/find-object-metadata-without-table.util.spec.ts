import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { findObjectMetadataWithoutTable } from 'src/database/commands/upgrade-version-command/2-46/utils/find-object-metadata-without-table.util';
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
  isRemote = false,
}: {
  nameSingular: string;
  applicationUniversalIdentifier?: string;
  isRemote?: boolean;
}) =>
  getFlatObjectMetadataMock({
    id: `object-${nameSingular}`,
    universalIdentifier: `object-uid-${nameSingular}`,
    applicationUniversalIdentifier,
    nameSingular,
    namePlural: `${nameSingular}s`,
    isRemote,
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

const toFlatEntityMaps = <TFlatEntity extends FlatObjectMetadata | FlatFieldMetadata>(
  flatEntities: TFlatEntity[],
) =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const findWithoutTable = ({
  flatObjectMetadatas,
  flatFieldMetadatas = [],
  existingTableNames,
}: {
  flatObjectMetadatas: FlatObjectMetadata[];
  flatFieldMetadatas?: FlatFieldMetadata[];
  existingTableNames: string[];
}) => {
  const result = findObjectMetadataWithoutTable({
    flatObjectMetadataMaps: toFlatEntityMaps(flatObjectMetadatas),
    flatFieldMetadataMaps: toFlatEntityMaps(flatFieldMetadatas),
    existingTableNames: new Set(existingTableNames),
    workspaceCustomApplicationUniversalIdentifier: CUSTOM_APP_UID,
  });

  return {
    deletable: result.deletableFlatObjectMetadatas.map(
      ({ nameSingular }) => nameSingular,
    ),
    inverseFields: result.inverseFlatFieldMetadatasToDelete.map(
      ({ id }) => id,
    ),
    nonDeletable: result.nonDeletableFlatObjectMetadatas.map(
      ({ nameSingular }) => nameSingular,
    ),
  };
};

describe('findObjectMetadataWithoutTable', () => {
  it('leaves objects whose table exists alone', () => {
    expect(
      findWithoutTable({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({ nameSingular: 'pet' }),
          buildFlatObjectMetadata({
            nameSingular: 'company',
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          }),
        ],
        existingTableNames: ['_pet', 'company'],
      }),
    ).toEqual({ deletable: [], inverseFields: [], nonDeletable: [] });
  });

  it('marks a custom object without table as deletable', () => {
    expect(
      findWithoutTable({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({ nameSingular: 'viewField' }),
          buildFlatObjectMetadata({ nameSingular: 'pet' }),
        ],
        existingTableNames: ['_pet'],
      }),
    ).toEqual({ deletable: ['viewField'], inverseFields: [], nonDeletable: [] });
  });

  it('marks a custom object as deletable even when its unprefixed table exists', () => {
    expect(
      findWithoutTable({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({ nameSingular: 'viewField' }),
        ],
        existingTableNames: ['viewField'],
      }),
    ).toEqual({ deletable: ['viewField'], inverseFields: [], nonDeletable: [] });
  });

  it('ignores remote objects', () => {
    expect(
      findWithoutTable({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({ nameSingular: 'stripeCustomer', isRemote: true }),
        ],
        existingTableNames: [],
      }),
    ).toEqual({ deletable: [], inverseFields: [], nonDeletable: [] });
  });

  it('reports objects of other applications without deleting them', () => {
    expect(
      findWithoutTable({
        flatObjectMetadatas: [
          buildFlatObjectMetadata({
            nameSingular: 'company',
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          }),
          buildFlatObjectMetadata({
            nameSingular: 'invoice',
            applicationUniversalIdentifier: INSTALLED_APP_UID,
          }),
        ],
        existingTableNames: [],
      }),
    ).toEqual({
      deletable: [],
      inverseFields: [],
      nonDeletable: ['company', 'invoice'],
    });
  });

  it('deletes the relation fields that surviving objects hold on a deleted object', () => {
    expect(
      findWithoutTable({
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
      deletable: ['view', 'viewField'],
      inverseFields: [
        'field-pet-favoriteViewField',
        'field-timelineActivity-targetView',
      ],
      nonDeletable: [],
    });
  });
});
