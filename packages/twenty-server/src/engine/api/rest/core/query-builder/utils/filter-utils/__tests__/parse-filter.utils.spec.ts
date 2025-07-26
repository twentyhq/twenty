import {
  fieldNumberMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { parseFilter } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils';
import { FieldMetadataMap } from 'src/engine/metadata-modules/types/field-metadata-map';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('parseFilter', () => {
  const completeFieldNumberMock = getMockFieldMetadataEntity({
    workspaceId: '20202020-0000-0000-0000-000000000000',
    objectMetadataId: '20202020-0000-0000-0000-000000000001',
    id: '20202020-0000-0000-0000-000000000002',
    type: fieldNumberMock.type,
    name: fieldNumberMock.name,
    label: 'Field Number',
    isNullable: fieldNumberMock.isNullable,
    defaultValue: fieldNumberMock.defaultValue,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const completeFieldTextMock = getMockFieldMetadataEntity({
    workspaceId: '20202020-0000-0000-0000-000000000000',
    objectMetadataId: '20202020-0000-0000-0000-000000000001',
    id: '20202020-0000-0000-0000-000000000003',
    type: fieldTextMock.type,
    name: fieldTextMock.name,
    label: 'Field Text',
    isNullable: fieldTextMock.isNullable,
    defaultValue: fieldTextMock.defaultValue,
    isLabelSyncedWithName: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const fieldsById: FieldMetadataMap = {
    'field-number-id': completeFieldNumberMock,
    'field-text-id': completeFieldTextMock,
  };

  const mockObjectMetadataWithFieldMaps: ObjectMetadataItemWithFieldMaps = {
    ...objectMetadataItemMock,
    fieldsById,
    fieldIdByName: {
      [completeFieldNumberMock.name]: completeFieldNumberMock.id,
      [completeFieldTextMock.name]: completeFieldTextMock.id,
    },
    fieldIdByJoinColumnName: {},
    indexMetadatas: [],
  };

  it('should parse string filter test 1', () => {
    expect(
      parseFilter(
        'and(fieldNumber[eq]:1,fieldNumber[eq]:2)',
        mockObjectMetadataWithFieldMaps,
      ),
    ).toEqual({
      and: [{ fieldNumber: { eq: '1' } }, { fieldNumber: { eq: '2' } }],
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
        { fieldNumber: { eq: '1' } },
        { or: [{ fieldNumber: { eq: '2' } }, { fieldNumber: { eq: '3' } }] },
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
        { fieldNumber: { eq: '1' } },
        {
          or: [
            { fieldNumber: { eq: '2' } },
            { fieldNumber: { eq: '3' } },
            {
              and: [{ fieldNumber: { eq: '6' } }, { fieldNumber: { eq: '7' } }],
            },
          ],
        },
        { or: [{ fieldNumber: { eq: '4' } }, { fieldNumber: { eq: '5' } }] },
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
                { fieldNumber: { eq: '6' } },
                { fieldText: { ilike: '%val%' } },
              ],
            },
          ],
        },
        { or: [{ fieldNumber: { eq: '4' } }, { fieldText: { is: 'NULL' } }] },
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
        { fieldNumber: { eq: '1' } },
        {
          not: { fieldNumber: { eq: '2' } },
        },
      ],
    });
  });
});
