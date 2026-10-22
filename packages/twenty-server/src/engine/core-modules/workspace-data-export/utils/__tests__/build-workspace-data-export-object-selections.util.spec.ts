import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { buildWorkspaceDataExportObjectSelections } from 'src/engine/core-modules/workspace-data-export/utils/build-workspace-data-export-object-selections.util';
import { type FlatFieldMetadataMaps } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata-maps.type';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';

const buildMaps = <TEntity extends { id: string }>(entities: TEntity[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.id, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.id]),
  ),
  universalIdentifiersByApplicationId: {},
});

const fields = [
  { id: 'name', type: FieldMetadataType.TEXT, isActive: true },
  { id: 'legacy-code', type: FieldMetadataType.TEXT, isActive: false },
  { id: 'search-vector', type: FieldMetadataType.TS_VECTOR, isActive: true },
  {
    id: 'owner',
    type: FieldMetadataType.RELATION,
    isActive: true,
    settings: { relationType: RelationType.MANY_TO_ONE },
  },
  {
    id: 'tasks',
    type: FieldMetadataType.RELATION,
    isActive: true,
    settings: { relationType: RelationType.ONE_TO_MANY },
  },
];

const objects = [
  {
    id: 'pet',
    nameSingular: 'pet',
    labelSingular: 'Pet',
    isActive: false,
    fieldIds: ['legacy-code'],
  },
  {
    id: 'company',
    nameSingular: 'company',
    labelSingular: 'Company',
    isActive: true,
    fieldIds: fields.map((field) => field.id),
  },
];

describe('buildWorkspaceDataExportObjectSelections', () => {
  it('keeps inactive objects and fields, which still hold stored data', () => {
    const selections = buildWorkspaceDataExportObjectSelections({
      flatObjectMetadataMaps: buildMaps(
        objects,
      ) as unknown as FlatObjectMetadataMaps,
      flatFieldMetadataMaps: buildMaps(
        fields,
      ) as unknown as FlatFieldMetadataMaps,
    });

    expect(selections).toEqual([
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
        fieldMetadataIds: ['legacy-code'],
      },
    ]);
  });
});
