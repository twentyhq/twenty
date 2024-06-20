import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { parseFilter } from 'src/engine/api/rest/core/query-builder/utils/filter-utils/parse-filter.utils';

describe('parseFilter', () => {
  it('should parse string filter test 1', () => {
    expect(
      parseFilter(
        'and(fieldNumber[eq]:1,fieldNumber[eq]:2)',
        objectMetadataItemMock,
      ),
    ).toEqual({
      and: [{ fieldNumber: { eq: 1 } }, { fieldNumber: { eq: 2 } }],
    });
  });

  it('should parse string filter test 2', () => {
    expect(
      parseFilter(
        'and(fieldNumber[eq]:1,or(fieldNumber[eq]:2,fieldNumber[eq]:3))',
        objectMetadataItemMock,
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
        objectMetadataItemMock,
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
        objectMetadataItemMock,
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
        objectMetadataItemMock,
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
