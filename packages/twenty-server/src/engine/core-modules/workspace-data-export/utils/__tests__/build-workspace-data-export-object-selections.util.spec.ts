import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildWorkspaceDataExportObjectSelections } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-object-selections.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> =>
  flatEntities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildField = ({
  id,
  objectMetadataId,
  type,
  isActive = true,
  relationType,
}: {
  id: string;
  objectMetadataId: string;
  type: FieldMetadataType;
  isActive?: boolean;
  relationType?: RelationType;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: id,
    objectMetadataId,
    type,
    isActive,
    settings: isDefined(relationType)
      ? { relationType, joinColumnName: `${id}Id` }
      : null,
  });

const fields = [
  buildField({
    id: 'name',
    objectMetadataId: 'company',
    type: FieldMetadataType.TEXT,
  }),
  buildField({
    id: 'legacy-code',
    objectMetadataId: 'company',
    type: FieldMetadataType.TEXT,
    isActive: false,
  }),
  buildField({
    id: 'search-vector',
    objectMetadataId: 'company',
    type: FieldMetadataType.TS_VECTOR,
  }),
  buildField({
    id: 'owner',
    objectMetadataId: 'company',
    type: FieldMetadataType.RELATION,
    relationType: RelationType.MANY_TO_ONE,
  }),
  buildField({
    id: 'tasks',
    objectMetadataId: 'company',
    type: FieldMetadataType.RELATION,
    relationType: RelationType.ONE_TO_MANY,
  }),
  buildField({
    id: 'nickname',
    objectMetadataId: 'pet',
    type: FieldMetadataType.TEXT,
    isActive: false,
  }),
];

const objects = [
  getFlatObjectMetadataMock({
    id: 'pet',
    universalIdentifier: 'pet',
    nameSingular: 'pet',
    labelSingular: 'Pet',
    isActive: false,
    fieldIds: ['nickname'],
  }),
  getFlatObjectMetadataMock({
    id: 'company',
    universalIdentifier: 'company',
    nameSingular: 'company',
    labelSingular: 'Company',
    fieldIds: ['name', 'legacy-code', 'search-vector', 'owner', 'tasks'],
  }),
];

describe('buildWorkspaceDataExportObjectSelections', () => {
  it('keeps inactive objects and fields, which still hold stored data', () => {
    expect(
      buildWorkspaceDataExportObjectSelections({
        flatObjectMetadataMaps: buildFlatEntityMaps(objects),
        flatFieldMetadataMaps: buildFlatEntityMaps(fields),
      }),
    ).toEqual([
      {
        objectMetadataId: 'company',
        nameSingular: 'company',
        labelSingular: 'Company',
        fieldMetadataIds: ['name', 'legacy-code', 'owner'],
      },
      {
        objectMetadataId: 'pet',
        nameSingular: 'pet',
        labelSingular: 'Pet',
        fieldMetadataIds: ['nickname'],
      },
    ]);
  });
});
