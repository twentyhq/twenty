import { Test, TestingModule } from '@nestjs/testing';

import { OrderByDirection } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  objectMetadataMapItemMock,
  objectMetadataMapsMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { OrderByInputFactory } from 'src/engine/api/rest/input-factories/order-by-input.factory';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

describe('OrderByInputFactory', () => {
  const objectMetadata: {
    objectMetadataMaps: ObjectMetadataMaps;
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps;
  } = {
    objectMetadataMaps: objectMetadataMapsMock,
    objectMetadataMapItem: objectMetadataMapItemMock,
  };

  let service: OrderByInputFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderByInputFactory],
    }).compile();

    service = module.get<OrderByInputFactory>(OrderByInputFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return default if order by missing', () => {
      const request: any = { query: {} };

      expect(service.create(request, objectMetadata)).toEqual([
        {},
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should create order by parser properly', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber[AscNullsFirst],fieldText[DescNullsLast]',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual([
        { fieldNumber: OrderByDirection.AscNullsFirst },
        { fieldText: OrderByDirection.DescNullsLast },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should choose default direction if missing', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual([
        { fieldNumber: OrderByDirection.AscNullsFirst },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should handle complex fields', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual([
        { fieldCurrency: { amountMicros: OrderByDirection.AscNullsFirst } },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should handle complex fields with direction', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros[DescNullsLast]',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual([
        { fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast } },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should handle multiple complex fields with direction', () => {
      const request: any = {
        query: {
          order_by:
            'fieldCurrency.amountMicros[DescNullsLast],fieldText.label[AscNullsLast]',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual([
        { fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast } },
        { fieldText: { label: OrderByDirection.AscNullsLast } },
        { id: OrderByDirection.AscNullsFirst },
      ]);
    });

    it('should throw if direction invalid', () => {
      const request: any = {
        query: {
          order_by: 'fieldText[invalid]',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "'order_by' direction 'invalid' invalid. Allowed values are 'AscNullsFirst', 'AscNullsLast', 'DescNullsFirst', 'DescNullsLast'. eg: ?order_by=field_1[AscNullsFirst],field_2[DescNullsLast],field_3",
      );
    });

    it('should throw if field invalid', () => {
      const request: any = {
        query: {
          order_by: 'wrongField[DescNullsLast]',
        },
      };

      expect(() => service.create(request, objectMetadata)).toThrow(
        "field 'wrongField' does not exist in 'objectName' object",
      );
    });
  });
});
