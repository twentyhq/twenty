import { Test, TestingModule } from '@nestjs/testing';
import { FieldCalculationService } from './field-calculation.service';
import { FieldMetadataType } from 'twenty-shared/types';

describe('FieldCalculationService', () => {
  let service: FieldCalculationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FieldCalculationService],
    }).compile();

    service = module.get<FieldCalculationService>(FieldCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluate', () => {
    it('should calculate simple formulas', () => {
      const result = service.evaluate('a + b', { a: 10, b: 20 });
      expect(result).toBe(30);
    });

    it('should handle multiplication and division', () => {
      const result = service.evaluate('Price * (1 - Discount / 100)', {
        Price: 100,
        Discount: 10,
      });
      expect(result).toBe(90);
    });

    it('should throw on invalid formulas', () => {
      expect(() => service.evaluate('a +', { a: 10 })).toThrow();
    });
  });

  describe('sortFieldsByDependency', () => {
    it('should sort fields by dependency', () => {
      const fields: any[] = [
        {
          name: 'Total',
          type: FieldMetadataType.NUMBER,
          settings: { calculationFormula: 'Subtotal + Tax' },
        },
        {
          name: 'Subtotal',
          type: FieldMetadataType.NUMBER,
          settings: { calculationFormula: 'Price * Quantity' },
        },
      ];

      const sorted = service.sortFieldsByDependency(fields);
      expect(sorted[0].name).toBe('Subtotal');
      expect(sorted[1].name).toBe('Total');
    });

    it('should throw on circular dependencies', () => {
      const fields: any[] = [
        {
          name: 'A',
          type: FieldMetadataType.NUMBER,
          settings: { calculationFormula: 'B + 1' },
        },
        {
          name: 'B',
          type: FieldMetadataType.NUMBER,
          settings: { calculationFormula: 'A + 1' },
        },
      ];

      expect(() => service.sortFieldsByDependency(fields)).toThrow(
        'Circular dependency detected',
      );
    });
  });
});
