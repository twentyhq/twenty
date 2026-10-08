import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { extractValidationRuleFormFills } from '@/validation-rules/utils/extractValidationRuleFormFills';

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
    output: { success: true, message: 'Filled', result: FILL },
    ...part,
  }) as unknown as ExtendedUIMessagePart;

describe('extractValidationRuleFormFills', () => {
  it('reads a fill called directly or through execute_tool', () => {
    expect(
      extractValidationRuleFormFills([
        buildToolPart({}),
        buildToolPart({
          type: 'tool-execute_tool',
          toolCallId: 'call-2',
          input: { toolName: 'fill_validation_rule_form', arguments: FILL },
          output: {
            success: true,
            message: 'Filled',
            result: { ...FILL, validationRuleId: undefined },
          },
        }),
      ]),
    ).toEqual([
      { ...FILL, toolCallId: 'call-1', errorFieldMetadataId: null },
      {
        ...FILL,
        toolCallId: 'call-2',
        validationRuleId: null,
        errorFieldMetadataId: null,
      },
    ]);
  });

  it('ignores rejected, unfinished and other tool calls', () => {
    expect(
      extractValidationRuleFormFills([
        buildToolPart({
          output: { success: false, message: 'Unknown field "amout"' },
        }),
        buildToolPart({ state: 'input-available', output: undefined }),
        buildToolPart({ type: 'tool-create_validation_rule' }),
        { type: 'text', text: 'Done' } as ExtendedUIMessagePart,
      ]),
    ).toEqual([]);
  });
});
