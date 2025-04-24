import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  fieldNumberMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { parseFilter } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';

describe('parseFilter', () => {
  const completeFieldNumberMock: FieldMetadataInterface = {
    id: 'field-number-id',
    type: fieldNumberMock.type,
    name: fieldNumberMock.name,
    label: 'Field Number',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldNumberMock.isNullable,
    defaultValue: fieldNumberMock.defaultValue,
  };

  const completeFieldTextMock: FieldMetadataInterface = {
    id: 'field-text-id',
    type: fieldTextMock.type,
    name: fieldTextMock.name,
    label: 'Field Text',
    objectMetadataId: 'object-metadata-id',
    isNullable: fieldTextMock.isNullable,
    defaultValue: fieldTextMock.defaultValue,
  };

  const fieldsById: FieldMetadataMap = {
    'field-number-id': completeFieldNumberMock,
    'field-text-id': completeFieldTextMock,
  };

  const fieldsByName: FieldMetadataMap = {
    [completeFieldNumberMock.name]: completeFieldNumberMock,
    [completeFieldTextMock.name]: completeFieldTextMock,
  };

  const mockObjectMetadataWithFieldMaps = {
    ...objectMetadataItemMock,
    fieldsById,
    fieldsByName,
    fieldsByJoinColumnName: {},
  };

  it('should parse string filter test 1', () => {
    expect(
      parseFilter(
        'and(fieldNumber[eq]:1,fieldNumber[eq]:2)',
        mockObjectMetadataWithFieldMaps,
      ),
    ).toEqual({
      and: [{ fieldNumber: { eq: 1 } }, { fieldNumber: { eq: 2 } }],
    });
  });

  it('should parse string filter test 2', () => {
    expect(
      parseFilter(
        'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3))',
        mockObjectMetadataWithFieldMaps,
      ),
    ).toEqual({
      and: [
        { fieldNumber: { eq: 1 } },
        { or: [{ fieldNumber: { eq: 2 } }, { fieldNumber: { eq: 3 } }] },
      ],
    });
  });

  it('should parse string filter test 3', () => {
    expect(
      parseFilter(
        'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3,and(fieldNumber[eq]:6,fieldNumber[eq]:7)),or(fieldNumber[eq]:4,fieldNumber[eq]:5))',
        mockObjectMetadataWithFieldMaps,
      ),
    ).toEqual({
      and: [
        { fieldNumber: { eq: 1 } },
        {
          or: [
            { fieldNumber: { eq: 2 } },
            { fieldNumber: { eq: 3 } },
            { and: [{ fieldNumber: { eq: 6 } }, { fieldNumber: { eq: 7 } }] },
          ],
        },
        { or: [{ fieldNumber: { eq: 4 } }, { fieldNumber: { eq: 5 } }] },
      ],
    });
  });

  it('should parse string filter test 4', () => {
    expect(
      parseFilter(
        'and(fieldText[gt]:"val,ue",or(fieldNumber[is]:NOT_NULL,not(fieldText[startsWith]:"val"),and(fieldNumber[eq]:6,fieldText[ilike]:"%val%")),or(fieldNumber[eq]:4,fieldText[is]:NULL))',
        mockObjectMetadataWithFieldMaps,
      ),
    ).toEqual({
      and: [
        { fieldText: { gt: 'val,ue' } },
        {
          or: [
            { fieldNumber: { is: 'NOT_NULL' } },
            { not: { fieldText: { startsWith: 'val' } } },
            {
              and: [
                { fieldNumber: { eq: 6 } },
                { fieldText: { ilike: '%val%' } },
              ],
            },
          ],
        },
        { or: [{ fieldNumber: { eq: 4 } }, { fieldText: { is: 'NULL' } }] },
      ],
    });
  });

  it('should handler not', () => {
    expect(
      parseFilter(
        'and(fieldNumber[eq]:1,not(fieldNumber[eq]:2))',
        mockObjectMetadataWithFieldMaps,
      ),
    ).toEqual({
      and: [
        { fieldNumber: { eq: 1 } },
        {
          not: { fieldNumber: { eq: 2 } },
        },
      ],
    });
  });
});
