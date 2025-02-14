import { Test, TestingModule } from '@nestjs/testing';

import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { FilterInputFactory } from 'src/engine/api/rest/input-factories/filter-input.factory';

describe('FilterInputFactory', () => {
  const objectMetadata = { objectMetadataItem: objectMetadataItemMock };

  let service: FilterInputFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilterInputFactory],
    }).compile();

    service = module.get<FilterInputFactory>(FilterInputFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if filter missing', () => {
      const request: any = { query: {} };

      expect(service.create(request, objectMetadata)).toEqual({});
    });

    it('should throw when wrong field provided', () => {
      const request: any = {
        query: {
          filter: 'wrongField[eq]:1',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "field 'wrongField' does not exist in 'objectName' object",
      );
    });

    it('should throw when wrong comparator provided', () => {
      const request: any = {
        query: {
          filter: 'fieldNumber[wrongComparator]:1',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "'filter' invalid for 'fieldNumber[wrongComparator]:1', comparator wrongComparator not in eq, neq, in, containsAny, is, gt, gte, lt, lte, startsWith, like, ilike",
      );
    });

    it('should throw when wrong filter provided', () => {
      const request: any = {
        query: {
          filter: 'fieldNumber[wrongComparator:1',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "'filter' invalid for 'fieldNumber[wrongComparator:1'. eg: price[gte]:10",
      );
    });

    it('should throw when parenthesis are not closed', () => {
      const request: any = {
        query: {
          filter: 'and(fieldNumber[eq]:1,not(fieldNumber[neq]:1)',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "'filter' invalid. 1 close bracket is missing in the query",
      );
    });

    it('should create filter parser properly', () => {
      const request: any = {
        query: {
          filter: 'fieldNumber[eq]:1,fieldText[eq]:"Test"',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        and: [{ fieldNumber: { eq: 1 } }, { fieldText: { eq: 'Test' } }],
      });
    });

    it('should create complex filter parser properly', () => {
      const request: any = {
        query: {
          filter:
            'and(fieldNumber[eq]:1,fieldText[gte]:"Test",not(fieldText[ilike]:"%val%"),or(not(and(fieldText[startsWith]:"test",fieldNumber[in]:[2,4,5])),fieldCurrency.amountMicros[gt]:1))',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        and: [
          { fieldNumber: { eq: 1 } },
          { fieldText: { gte: 'Test' } },
          { not: { fieldText: { ilike: '%val%' } } },
          {
            or: [
              {
                not: {
                  and: [
                    { fieldText: { startsWith: 'test' } },
                    { fieldNumber: { in: [2, 4, 5] } },
                  ],
                },
              },
              { fieldCurrency: { amountMicros: { gt: '1' } } },
            ],
          },
        ],
      });
    });
  });
});
