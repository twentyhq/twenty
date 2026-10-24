import { getTriggerSettingsWithInputSchema } from '@/logic-functions/utils/getTriggerSettingsWithInputSchema';
import { jsonSchemaToInputSchema } from 'twenty-shared/logic-function';

const INPUT_JSON_SCHEMA = {
  type: 'object' as const,
  properties: { name: { type: 'string' as const } },
};

describe('getTriggerSettingsWithInputSchema', () => {
  it('sets the inferred schema on both configured triggers', () => {
    expect(
      getTriggerSettingsWithInputSchema({
        toolTriggerSettings: {
          inputSchema: { type: 'object', properties: {} },
        },
        workflowActionTriggerSettings: { inputSchema: [] },
        inputJsonSchema: INPUT_JSON_SCHEMA,
      }),
    ).toEqual({
      toolTriggerSettings: { inputSchema: INPUT_JSON_SCHEMA },
      workflowActionTriggerSettings: {
        inputSchema: jsonSchemaToInputSchema(INPUT_JSON_SCHEMA),
      },
    });
  });

  it('leaves unconfigured triggers unset', () => {
    expect(
      getTriggerSettingsWithInputSchema({
        toolTriggerSettings: null,
        workflowActionTriggerSettings: null,
        inputJsonSchema: INPUT_JSON_SCHEMA,
      }),
    ).toEqual({
      toolTriggerSettings: null,
      workflowActionTriggerSettings: null,
    });
  });
});
