import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { fieldMetadataConfigByFieldName } from 'src/engine/api/common/common-args-processors/data-arg-processor/__tests__/constants/field-metadata-config-by-field-name.constant';
import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { failingFilterInputsByFieldMetadataType } from './constants/failing-filter-inputs-by-field-metadata-type.constant';
import { successfulFilterInputsByFieldMetadataType } from './constants/successful-filter-inputs-by-field-metadata-type.constant';

describe('FilterArgProcessorService', () => {
  let filterArgProcessorService: FilterArgProcessorService;

  const createFlatFieldMetadataMaps = (
    fieldNames: string[],
  ): FlatEntityMaps<FlatFieldMetadata> => {
    const byUniversalIdentifier: Record<string, FlatFieldMetadata> = {};
    const universalIdentifierById: Record<string, string> = {};

    for (const fieldName of fieldNames) {
      const config = fieldMetadataConfigByFieldName[fieldName];

      if (!config) {
        throw new Error(`No config found for field: ${fieldName}`);
      }

      const fieldId = `${fieldName}-id`;
      const universalId = `${fieldName}-universal-id`;

      byUniversalIdentifier[universalId] = {
        id: fieldId,
        name: config.name,
        type: config.type ?? FieldMetadataType.TEXT,
        isNullable: config.isNullable ?? true,
        objectMetadataId: 'object-id',
        universalIdentifier: universalId,
        options: config.options,
        settings: config.settings,
        defaultValue: config.defaultValue,
      } as FlatFieldMetadata;

      universalIdentifierById[fieldId] = universalId;
    }

    return {
      byUniversalIdentifier,
      universalIdentifierById,
      universalIdentifiersByApplicationId: {},
    } as unknown as FlatEntityMaps<FlatFieldMetadata>;
  };

  const createFlatObjectMetadata = (fieldNames: string[]): FlatObjectMetadata =>
    ({
      id: 'object-id',
      nameSingular: 'testObject',
      namePlural: 'testObjects',
      isCustom: false,
      fieldIds: fieldNames.map((name) => `${name}-id`),
      universalIdentifier: 'test-object-universal-id',
      labelIdentifierFieldMetadataUniversalIdentifier: null,
      imageIdentifierFieldMetadataUniversalIdentifier: null,
    }) as unknown as FlatObjectMetadata;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilterArgProcessorService],
    }).compile();

    filterArgProcessorService = module.get<FilterArgProcessorService>(
      FilterArgProcessorService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('failing filter inputs validation', () => {
    const fieldMetadataTypesToTest = Object.keys(
      failingFilterInputsByFieldMetadataType,
    ) as FieldMetadataType[];

    for (const fieldMetadataType of fieldMetadataTypesToTest) {
      const testCases =
        failingFilterInputsByFieldMetadataType[fieldMetadataType];

      if (!testCases) {
        continue;
      }

      describe(`${fieldMetadataType}`, () => {
        for (const [index, testCase] of testCases.entries()) {
          const fieldName = Object.keys(testCase.filter)[0];

          it(`should throw for invalid filter #${index + 1}: ${JSON.stringify(testCase.filter)}`, () => {
            const fieldNames = [fieldName];

            const flatFieldMetadataMaps =
              createFlatFieldMetadataMaps(fieldNames);
            const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

            expect(() =>
              filterArgProcessorService.process({
                filter: testCase.filter,
                flatObjectMetadata,
                flatFieldMetadataMaps,
              }),
            ).toThrowErrorMatchingSnapshot();
          });
        }
      });
    }
  });

  describe('successful filter inputs validation', () => {
    const fieldMetadataTypesToTest = Object.keys(
      successfulFilterInputsByFieldMetadataType,
    ) as FieldMetadataType[];

    for (const fieldMetadataType of fieldMetadataTypesToTest) {
      const testCases =
        successfulFilterInputsByFieldMetadataType[fieldMetadataType];

      if (!testCases) {
        continue;
      }

      describe(`${fieldMetadataType}`, () => {
        for (const [index, testCase] of testCases.entries()) {
          const fieldName = Object.keys(testCase.filter)[0];

          it(`should process valid filter #${index + 1}: ${JSON.stringify(testCase.filter)}`, () => {
            const fieldNames = [fieldName];

            const flatFieldMetadataMaps =
              createFlatFieldMetadataMaps(fieldNames);
            const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

            const result = filterArgProcessorService.process({
              filter: testCase.filter,
              flatObjectMetadata,
              flatFieldMetadataMaps,
            });

            const expectedResult = testCase.expected ?? testCase.filter;

            expect(result).toBeDefined();
            expect(result).toEqual(expectedResult);
          });
        }
      });
    }
  });

  describe('logical operators', () => {
    it('should process filter with "and" operator', () => {
      const fieldNames = ['textField', 'numberField'];
      const flatFieldMetadataMaps = createFlatFieldMetadataMaps(fieldNames);
      const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

      const filter = {
        and: [{ textField: { eq: 'test' } }, { numberField: { gt: 0 } }],
      };

      const result = filterArgProcessorService.process({
        filter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual(filter);
    });

    it('should process filter with "or" operator', () => {
      const fieldNames = ['textField', 'numberField'];
      const flatFieldMetadataMaps = createFlatFieldMetadataMaps(fieldNames);
      const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

      const filter = {
        or: [{ textField: { eq: 'test' } }, { numberField: { gt: 0 } }],
      };

      const result = filterArgProcessorService.process({
        filter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual(filter);
    });

    it('should process filter with "not" operator', () => {
      const fieldNames = ['textField'];
      const flatFieldMetadataMaps = createFlatFieldMetadataMaps(fieldNames);
      const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

      const filter = {
        not: { textField: { eq: 'test' } },
      };

      const result = filterArgProcessorService.process({
        filter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual(filter);
    });

    it('should process nested logical operators', () => {
      const fieldNames = ['textField', 'numberField'];
      const flatFieldMetadataMaps = createFlatFieldMetadataMaps(fieldNames);
      const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

      const filter = {
        and: [
          {
            or: [
              { textField: { eq: 'test1' } },
              { textField: { eq: 'test2' } },
            ],
          },
          { numberField: { gt: 0 } },
        ],
      };

      const result = filterArgProcessorService.process({
        filter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual(filter);
    });
  });

  describe('value transformation', () => {
    it('should coerce string to number for NUMBER field', () => {
      const fieldNames = ['numberField'];
      const flatFieldMetadataMaps = createFlatFieldMetadataMaps(fieldNames);
      const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

      const result = filterArgProcessorService.process({
        filter: { numberField: { eq: '42' } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({ numberField: { eq: 42 } });
    });

    it('should coerce string to boolean for BOOLEAN field', () => {
      const fieldNames = ['booleanField'];
      const flatFieldMetadataMaps = createFlatFieldMetadataMaps(fieldNames);
      const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

      const result = filterArgProcessorService.process({
        filter: { booleanField: { eq: 'true' } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({ booleanField: { eq: true } });
    });

    it('should preserve null values in "in" operator', () => {
      const fieldNames = ['numberField'];
      const flatFieldMetadataMaps = createFlatFieldMetadataMaps(fieldNames);
      const flatObjectMetadata = createFlatObjectMetadata(fieldNames);

      const result = filterArgProcessorService.process({
        filter: { numberField: { in: [1, null, 3] } },
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({ numberField: { in: [1, null, 3] } });
    });
  });

  describe('relation traversal', () => {
    // `source` has a MANY_TO_ONE `target` relation; `target` carries a
    // CURRENCY composite and a TEXT field.
    const createRelationFixture = () => {
      const sourceObjectId = 'source-obj-id';
      const targetObjectId = 'target-obj-id';
      const sourceUniversalId = 'source-obj-universal-id';
      const targetUniversalId = 'target-obj-universal-id';

      const relationFieldId = 'relation-field-id';
      const targetTextFieldId = 'target-text-field-id';
      const targetCurrencyFieldId = 'target-currency-field-id';

      const flatFieldMetadataMaps = {
        byUniversalIdentifier: {
          'relation-field-uid': {
            id: relationFieldId,
            name: 'target',
            type: FieldMetadataType.RELATION,
            isNullable: true,
            objectMetadataId: sourceObjectId,
            universalIdentifier: 'relation-field-uid',
            relationTargetObjectMetadataId: targetObjectId,
            settings: {
              relationType: RelationType.MANY_TO_ONE,
              joinColumnName: 'targetId',
            },
          },
          'target-text-uid': {
            id: targetTextFieldId,
            name: 'name',
            type: FieldMetadataType.TEXT,
            isNullable: true,
            objectMetadataId: targetObjectId,
            universalIdentifier: 'target-text-uid',
          },
          'target-currency-uid': {
            id: targetCurrencyFieldId,
            name: 'annualRecurringRevenue',
            type: FieldMetadataType.CURRENCY,
            isNullable: true,
            objectMetadataId: targetObjectId,
            universalIdentifier: 'target-currency-uid',
          },
        },
        universalIdentifierById: {
          [relationFieldId]: 'relation-field-uid',
          [targetTextFieldId]: 'target-text-uid',
          [targetCurrencyFieldId]: 'target-currency-uid',
        },
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatFieldMetadata>;

      const sourceObjectMetadata = {
        id: sourceObjectId,
        nameSingular: 'sourceObject',
        namePlural: 'sourceObjects',
        isCustom: false,
        fieldIds: [relationFieldId],
        universalIdentifier: sourceUniversalId,
        labelIdentifierFieldMetadataUniversalIdentifier: null,
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      } as unknown as FlatObjectMetadata;

      const targetObjectMetadata = {
        id: targetObjectId,
        nameSingular: 'targetObject',
        namePlural: 'targetObjects',
        isCustom: false,
        fieldIds: [targetTextFieldId, targetCurrencyFieldId],
        universalIdentifier: targetUniversalId,
        labelIdentifierFieldMetadataUniversalIdentifier: null,
        imageIdentifierFieldMetadataUniversalIdentifier: null,
      } as unknown as FlatObjectMetadata;

      const flatObjectMetadataMaps = {
        byUniversalIdentifier: {
          [sourceUniversalId]: sourceObjectMetadata,
          [targetUniversalId]: targetObjectMetadata,
        },
        universalIdentifierById: {
          [sourceObjectId]: sourceUniversalId,
          [targetObjectId]: targetUniversalId,
        },
        universalIdentifiersByApplicationId: {},
      } as unknown as FlatEntityMaps<FlatObjectMetadata>;

      return {
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        sourceObjectMetadata,
      };
    };

    it('should accept a relation traversal onto a scalar field on the target', () => {
      const {
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        sourceObjectMetadata,
      } = createRelationFixture();

      const filter = { target: { name: { eq: 'Airbnb' } } };

      const result = filterArgProcessorService.process({
        filter,
        flatObjectMetadata: sourceObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({ target: { name: { eq: 'Airbnb' } } });
    });

    it('should accept a relation traversal onto a composite sub-field without tripping the depth cap', () => {
      // Composite sub-field navigation is not a relation hop, so it must
      // not count against MAX_RELATION_FILTER_DEPTH = 1.
      const {
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        sourceObjectMetadata,
      } = createRelationFixture();

      const filter = {
        target: {
          annualRecurringRevenue: { amountMicros: { gte: 1_000_000 } },
        },
      };

      const result = filterArgProcessorService.process({
        filter,
        flatObjectMetadata: sourceObjectMetadata,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      });

      expect(result).toEqual({
        target: {
          annualRecurringRevenue: { amountMicros: { gte: 1_000_000 } },
        },
      });
    });

    it('should surface a field-not-found error when a relation filter uses an operator key as if it were a target field', () => {
      // `{ target: { eq: ... } }` recurses into the target object's
      // metadata and fails like any unknown field on that object.
      const {
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        sourceObjectMetadata,
      } = createRelationFixture();

      expect(() =>
        filterArgProcessorService.process({
          filter: {
            target: { eq: '00000000-0000-0000-0000-000000000000' },
          },
          flatObjectMetadata: sourceObjectMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
      ).toThrow(/targetObject doesn't have any "eq" field/);
    });

    it('should fall back to the FK-column hint when no object metadata maps are available', () => {
      // Without object metadata maps the recursion can't resolve the target,
      // so the only useful guidance left is "use the FK column".
      const { flatFieldMetadataMaps, sourceObjectMetadata } =
        createRelationFixture();

      expect(() =>
        filterArgProcessorService.process({
          filter: {
            target: { name: { eq: 'Anything' } },
          },
          flatObjectMetadata: sourceObjectMetadata,
          flatFieldMetadataMaps,
        }),
      ).toThrow(/use "targetId" instead/);
    });
  });
});
