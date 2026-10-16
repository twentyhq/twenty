import { FieldMetadataType } from 'twenty-shared/types';

import { restoreDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-49/utils/restore-derived-record-filter-properties.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';

const nameFlatFieldMetadata = getFlatFieldMetadataMock({
  universalIdentifier: 'company-name-field-universal-identifier',
  objectMetadataId: 'company-object-id',
  type: FieldMetadataType.TEXT,
  id: 'company-name-field-id',
  name: 'name',
  label: 'Name',
});

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: nameFlatFieldMetadata,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

describe('restoreDerivedRecordFilterProperties', () => {
  it('should restore the type, label and display value from field metadata', () => {
    expect(
      restoreDerivedRecordFilterProperties({
        recordFilter: {
          id: 'filter-id',
          fieldMetadataId: nameFlatFieldMetadata.id,
          operand: 'CONTAINS',
          value: '{{trigger.name}}',
        },
        flatFieldMetadataMaps,
      }),
    ).toEqual({
      id: 'filter-id',
      fieldMetadataId: nameFlatFieldMetadata.id,
      operand: 'CONTAINS',
      value: '{{trigger.name}}',
      type: 'TEXT',
      label: 'Name',
      displayValue: '{{trigger.name}}',
    });
  });

  it('should leave a filter whose field no longer exists unchanged', () => {
    const recordFilter = {
      id: 'filter-id',
      fieldMetadataId: 'deleted-field-id',
      operand: 'CONTAINS',
      value: 'a',
    };

    expect(
      restoreDerivedRecordFilterProperties({
        recordFilter,
        flatFieldMetadataMaps,
      }),
    ).toBe(recordFilter);
  });
});
