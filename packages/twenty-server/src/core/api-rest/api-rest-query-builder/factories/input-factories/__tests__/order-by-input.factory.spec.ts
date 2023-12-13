import { Test, TestingModule } from '@nestjs/testing';

import { OrderByDirection } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

import { objectMetadataItem } from 'src/utils/utils-test/object-metadata-item';
import { OrderByInputFactory } from 'src/core/api-rest/api-rest-query-builder/factories/input-factories/order-by-input.factory';

describe('OrderByInputFactory', () => {
  const objectMetadata = { objectMetadataItem: objectMetadataItem };

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

      expect(service.create(request, objectMetadata)).toEqual({});
    });

    it('should create order by parser properly', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber[AscNullsFirst],fieldString[DescNullsLast]',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        fieldNumber: OrderByDirection.AscNullsFirst,
        fieldString: OrderByDirection.DescNullsLast,
      });
    });

    it('should choose default direction if missing', () => {
      const request: any = {
        query: {
          order_by: 'fieldNumber',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        fieldNumber: OrderByDirection.AscNullsFirst,
      });
    });

    it('should handler complex fields', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        fieldCurrency: { amountMicros: OrderByDirection.AscNullsFirst },
      });
    });

    it('should handler complex fields with direction', () => {
      const request: any = {
        query: {
          order_by: 'fieldCurrency.amountMicros[DescNullsLast]',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast },
      });
    });

    it('should handler multiple complex fields with direction', () => {
      const request: any = {
        query: {
          order_by:
            'fieldCurrency.amountMicros[DescNullsLast],fieldLink.label[AscNullsLast]',
        },
      };

      expect(service.create(request, objectMetadata)).toEqual({
        fieldCurrency: { amountMicros: OrderByDirection.DescNullsLast },
        fieldLink: { label: OrderByDirection.AscNullsLast },
      });
    });

    it('should throw if direction invalid', () => {
      const request: any = {
        query: {
          order_by: 'fieldString[invalid]',
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
        "field 'wrongField' does not exist in 'testingObject' object",
      );
    });
  });
});
