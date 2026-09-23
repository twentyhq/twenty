import { computeValidationRuleCompletionLabels } from '@/validation-rules/utils/computeValidationRuleCompletionLabels';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

const FIELDS = [
  {
    name: 'amount',
    type: FieldMetadataType.CURRENCY,
    universalIdentifier: 'amount',
  },
  {
    name: 'company',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'employees',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'company-employees',
      },
    ],
  },
];

describe('computeValidationRuleCompletionLabels', () => {
  it('should suggest fields, functions and keywords at the top level', () => {
    const labels = computeValidationRuleCompletionLabels({
      textBeforeCursor: 'stage == "WON" and ',
      fields: FIELDS,
    });

    expect(labels).toEqual(
      expect.arrayContaining(['amount', 'company', 'isEmpty', 'and', 'now']),
    );
  });

  it('should suggest the fields of a related record after a relation', () => {
    expect(
      computeValidationRuleCompletionLabels({
        textBeforeCursor: 'company.',
        fields: FIELDS,
      }),
    ).toEqual(['employees']);
  });

  it('should suggest subfields after a composite field', () => {
    expect(
      computeValidationRuleCompletionLabels({
        textBeforeCursor: 'isEmpty(amount.am',
        fields: FIELDS,
      }),
    ).toEqual(['amountMicros', 'currencyCode']);
  });
});
