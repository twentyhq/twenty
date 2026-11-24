import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { compileFormulaExpression, isDefined } from 'twenty-shared/utils';

import { type FormulaAggregateBuilderState } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateBuilderState';
import { type FormulaAggregateCondition } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateCondition';
import { buildFormulaAggregateExpression } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaAggregateExpression';
import { buildFormulaFieldEditorInputs } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaFieldEditorInputs';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const PET_FIELDS = [
  { name: 'name', type: FieldMetadataType.TEXT },
  { name: 'age', type: FieldMetadataType.NUMBER },
  { name: 'birthday', type: FieldMetadataType.DATE },
  { name: 'species', type: FieldMetadataType.SELECT },
  { name: 'traits', type: FieldMetadataType.MULTI_SELECT },
  { name: 'isGoodWithKids', type: FieldMetadataType.BOOLEAN },
  { name: 'averageCostOfKibblePerMonth', type: FieldMetadataType.CURRENCY },
];

const buildCondition = (
  condition: Omit<FormulaAggregateCondition, 'id'>,
): FormulaAggregateCondition => ({ id: condition.fieldName, ...condition });

const build = (builderState: Partial<FormulaAggregateBuilderState>) =>
  buildFormulaAggregateExpression({
    builderState: {
      relationFieldName: 'ownedPets',
      functionName: 'count',
      conditions: [],
      ...builderState,
    },
    relatedFieldMetadataItems: PET_FIELDS,
  });

const buildWithCondition = (condition: Omit<FormulaAggregateCondition, 'id'>) =>
  build({ conditions: [buildCondition(condition)] });

describe('buildFormulaAggregateExpression', () => {
  describe('aggregate', () => {
    it('should count the related records', () => {
      expect(build({})).toBe('count(ownedPets)');
    });

    it('should ignore the aggregated field of a count', () => {
      expect(build({ aggregatedFieldName: 'age' })).toBe('count(ownedPets)');
    });

    it.each(['sum', 'avg', 'min', 'max'] as const)(
      'should aggregate a number field with %s',
      (functionName) => {
        expect(build({ functionName, aggregatedFieldName: 'age' })).toBe(
          `${functionName}(ownedPets.age)`,
        );
      },
    );

    it('should aggregate the amount of a currency field', () => {
      expect(
        build({
          functionName: 'sum',
          aggregatedFieldName: 'averageCostOfKibblePerMonth',
        }),
      ).toBe('sum(ownedPets.averageCostOfKibblePerMonth.amountMicros)');
    });

    it('should aggregate a date field', () => {
      expect(
        build({ functionName: 'max', aggregatedFieldName: 'birthday' }),
      ).toBe('max(ownedPets.birthday)');
    });

    it('should be undefined without a relation', () => {
      expect(build({ relationFieldName: '' })).toBeUndefined();
    });

    it('should be undefined without a field to aggregate', () => {
      expect(build({ functionName: 'sum' })).toBeUndefined();
      expect(
        build({ functionName: 'sum', aggregatedFieldName: 'unknownField' }),
      ).toBeUndefined();
    });
  });

  describe('conditions', () => {
    it('should quote a text value', () => {
      expect(
        buildWithCondition({
          fieldName: 'name',
          operand: ViewFilterOperand.IS,
          value: 'Rex',
        }),
      ).toBe('count(ownedPets, ownedPets.name == "Rex")');
    });

    it('should escape quotes and backslashes in a text value', () => {
      expect(
        buildWithCondition({
          fieldName: 'name',
          operand: ViewFilterOperand.IS_NOT,
          value: 'Say "hi" \\o/',
        }),
      ).toBe('count(ownedPets, ownedPets.name != "Say \\"hi\\" \\\\o/")');
    });

    it('should compare with an empty text', () => {
      expect(
        buildWithCondition({
          fieldName: 'name',
          operand: ViewFilterOperand.IS,
          value: '',
        }),
      ).toBe('count(ownedPets, ownedPets.name == "")');
    });

    it('should search in a text', () => {
      expect(
        buildWithCondition({
          fieldName: 'name',
          operand: ViewFilterOperand.CONTAINS,
          value: 'ex',
        }),
      ).toBe('count(ownedPets, includes(ownedPets.name, "ex"))');
      expect(
        buildWithCondition({
          fieldName: 'name',
          operand: ViewFilterOperand.DOES_NOT_CONTAIN,
          value: 'ex',
        }),
      ).toBe('count(ownedPets, not includes(ownedPets.name, "ex"))');
    });

    it('should compare a select with its quoted option value', () => {
      expect(
        buildWithCondition({
          fieldName: 'species',
          operand: ViewFilterOperand.IS,
          value: 'DOG',
        }),
      ).toBe('count(ownedPets, ownedPets.species == "DOG")');
    });

    it('should look for an option of a multi-select', () => {
      expect(
        buildWithCondition({
          fieldName: 'traits',
          operand: ViewFilterOperand.CONTAINS,
          value: 'PLAYFUL',
        }),
      ).toBe('count(ownedPets, includes(ownedPets.traits, "PLAYFUL"))');
    });

    it('should write numbers as literals', () => {
      expect(
        buildWithCondition({
          fieldName: 'age',
          operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
          value: ' 2.5 ',
        }),
      ).toBe('count(ownedPets, ownedPets.age >= 2.5)');
      expect(
        buildWithCondition({
          fieldName: 'age',
          operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
          value: '-3',
        }),
      ).toBe('count(ownedPets, ownedPets.age <= -3)');
      expect(
        buildWithCondition({
          fieldName: 'age',
          operand: ViewFilterOperand.IS,
          value: '1e21',
        }),
      ).toBe('count(ownedPets, ownedPets.age == 1000000000000000000000)');
    });

    it('should write booleans as true or false', () => {
      expect(
        buildWithCondition({
          fieldName: 'isGoodWithKids',
          operand: ViewFilterOperand.IS,
          value: 'false',
        }),
      ).toBe('count(ownedPets, ownedPets.isGoodWithKids == false)');
    });

    it('should check emptiness with isEmpty', () => {
      expect(
        buildWithCondition({
          fieldName: 'species',
          operand: ViewFilterOperand.IS_EMPTY,
          value: 'DOG',
        }),
      ).toBe('count(ownedPets, isEmpty(ownedPets.species))');
      expect(
        buildWithCondition({
          fieldName: 'name',
          operand: ViewFilterOperand.IS_NOT_EMPTY,
          value: '',
        }),
      ).toBe('count(ownedPets, not isEmpty(ownedPets.name))');
    });

    it('should combine conditions with and', () => {
      expect(
        build({
          functionName: 'avg',
          aggregatedFieldName: 'age',
          conditions: [
            buildCondition({
              fieldName: 'species',
              operand: ViewFilterOperand.IS,
              value: 'CAT',
            }),
            buildCondition({
              fieldName: 'isGoodWithKids',
              operand: ViewFilterOperand.IS,
              value: 'true',
            }),
          ],
        }),
      ).toBe(
        'avg(ownedPets.age, ownedPets.species == "CAT" and ownedPets.isGoodWithKids == true)',
      );
    });

    it('should leave out incomplete or unknown conditions', () => {
      expect(
        build({
          conditions: [
            buildCondition({
              fieldName: 'age',
              operand: ViewFilterOperand.IS,
              value: 'abc',
            }),
            buildCondition({
              fieldName: 'species',
              operand: ViewFilterOperand.IS,
              value: '',
            }),
            buildCondition({
              fieldName: 'isGoodWithKids',
              operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
              value: 'true',
            }),
            buildCondition({
              fieldName: 'unknownField',
              operand: ViewFilterOperand.IS,
              value: 'x',
            }),
          ],
        }),
      ).toBe('count(ownedPets)');
    });
  });

  it('should write expressions the formula compiler accepts', () => {
    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
    const rocketObjectMetadataItem = objectMetadataItems.find(
      ({ nameSingular }) => nameSingular === 'rocket',
    );

    if (!isDefined(rocketObjectMetadataItem)) {
      throw new Error('Rocket object metadata item not found');
    }

    const { fields } = buildFormulaFieldEditorInputs({
      objectMetadataItem: rocketObjectMetadataItem,
      objectMetadataItems,
    });

    const expressions = [
      build({
        functionName: 'sum',
        aggregatedFieldName: 'averageCostOfKibblePerMonth',
        conditions: [
          buildCondition({
            fieldName: 'traits',
            operand: ViewFilterOperand.DOES_NOT_CONTAIN,
            value: 'PLAYFUL',
          }),
          buildCondition({
            fieldName: 'name',
            operand: ViewFilterOperand.IS_NOT_EMPTY,
            value: '',
          }),
          buildCondition({
            fieldName: 'age',
            operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
            value: '-1',
          }),
        ],
      }),
      build({
        functionName: 'min',
        aggregatedFieldName: 'birthday',
        conditions: [
          buildCondition({
            fieldName: 'name',
            operand: ViewFilterOperand.IS,
            value: 'Say "hi" \\o/',
          }),
          buildCondition({
            fieldName: 'isGoodWithKids',
            operand: ViewFilterOperand.IS,
            value: 'true',
          }),
        ],
      }),
      build({
        conditions: [
          buildCondition({
            fieldName: 'species',
            operand: ViewFilterOperand.IS_NOT,
            value: 'DOG',
          }),
          buildCondition({
            fieldName: 'age',
            operand: ViewFilterOperand.IS_EMPTY,
            value: '',
          }),
        ],
      }),
    ];

    for (const expression of expressions) {
      expect(
        compileFormulaExpression({ expression: expression ?? '', fields }),
      ).toMatchObject({ isValid: true });
    }
  });
});
