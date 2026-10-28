import { describe, expect, it } from 'vitest';

import { jsonSchemaToInputSchema } from 'src/logic-functions/utils/json-schema-to-input-schema';
import { slackPostMessageInputSchema } from '../slack-post-message-input.schema';

describe('slackPostMessageInputSchema', () => {
  it('defines optional unfurlLinks and unfurlMedia boolean properties', () => {
    expect(slackPostMessageInputSchema.properties?.unfurlLinks).toEqual({
      type: 'boolean',
      label: 'Unfurl links',
      description:
        'Optional. Set to false to post without the link preview card.',
    });
    expect(slackPostMessageInputSchema.properties?.unfurlMedia).toEqual({
      type: 'boolean',
      label: 'Unfurl media',
      description:
        'Optional. Set to false to post without inline media previews.',
    });
  });

  it('does not include unfurlLinks or unfurlMedia in required fields', () => {
    expect(slackPostMessageInputSchema.required).toEqual([
      'slackChannelId',
      'messageText',
    ]);
  });

  it('converts unfurl options into workflow action input schema', () => {
    const [actionInputSchema] = jsonSchemaToInputSchema(
      slackPostMessageInputSchema,
    );

    expect(actionInputSchema.properties?.unfurlLinks).toEqual({
      type: 'boolean',
      label: 'Unfurl links',
    });
    expect(actionInputSchema.properties?.unfurlMedia).toEqual({
      type: 'boolean',
      label: 'Unfurl media',
    });
  });
});
