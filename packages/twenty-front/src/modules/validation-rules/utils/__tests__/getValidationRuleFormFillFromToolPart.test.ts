import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { getValidationRuleFormFillFromToolPart } from '@/validation-rules/utils/getValidationRuleFormFillFromToolPart';

const FILL = {
  objectMetadataId: 'object-opportunity',
  validationRuleId: 'rule-1',
  name: 'Customers need an amount',
  expression: "stage != 'CUSTOMER' or not isEmpty(amount)",
  message: 'Customer opportunities must have an amount.',
};

const buildToolPart = (part: Record<string, unknown>) =>
  ({
    type: 'tool-fill_validation_rule_form',
    toolCallId: 'call-1',
    state: 'output-available',
    input: FILL,
    output: { success: true, message: 'Ready', result: FILL },
    ...part,
  }) as unknown as ExtendedUIMessagePart;

describe('getValidationRuleFormFillFromToolPart', () => {
  it('reads a fill called directly', () => {
    expect(getValidationRuleFormFillFromToolPart(buildToolPart({}))).toEqual({
      ...FILL,
      errorFieldMetadataId: null,
    });
  });

  it('reads a fill called through execute_tool', () => {
    expect(
      getValidationRuleFormFillFromToolPart(
        buildToolPart({
          type: 'tool-execute_tool',
          input: { toolName: 'fill_validation_rule_form', arguments: FILL },
          output: {
            success: true,
            message: 'Ready',
            result: { ...FILL, validationRuleId: undefined },
          },
        }),
      ),
    ).toEqual({ ...FILL, validationRuleId: null, errorFieldMetadataId: null });
  });

  it.each([
    [
      'a rejected fill',
      { output: { success: false, message: 'Unknown field "amout"' } },
    ],
    ['an unfinished fill', { state: 'input-available', output: undefined }],
    ['another tool', { type: 'tool-create_validation_rule' }],
  ])('ignores %s', (_label, part) => {
    expect(
      getValidationRuleFormFillFromToolPart(buildToolPart(part)),
    ).toBeNull();
  });
});
