import { buildTriggerSettingsWithInputSchema } from '@/logic-functions/utils/buildTriggerSettingsWithInputSchema';
import {
  jsonSchemaToInputSchema,
  type InputJsonSchema,
} from 'twenty-shared/logic-function';

const INFERRED_JSON_SCHEMA: InputJsonSchema = {
  type: 'object',
  properties: { a: { type: 'string' } },
};

describe('buildTriggerSettingsWithInputSchema', () => {
  it('sets the inferred schema on the defined trigger settings', () => {
    expect(
      buildTriggerSettingsWithInputSchema({
        formValues: {
          toolTriggerSettings: { inputSchema: { type: 'object' } },
          workflowActionTriggerSettings: { inputSchema: [] },
        },
        inferredJsonSchema: INFERRED_JSON_SCHEMA,
      }),
    ).toEqual({
      toolTriggerSettings: { inputSchema: INFERRED_JSON_SCHEMA },
      workflowActionTriggerSettings: {
        inputSchema: jsonSchemaToInputSchema(INFERRED_JSON_SCHEMA),
      },
    });
  });

  it('keeps missing trigger settings null', () => {
    expect(
      buildTriggerSettingsWithInputSchema({
        formValues: {
          toolTriggerSettings: null,
          workflowActionTriggerSettings: null,
        },
        inferredJsonSchema: INFERRED_JSON_SCHEMA,
      }),
    ).toEqual({
      toolTriggerSettings: null,
      workflowActionTriggerSettings: null,
    });
  });
});
