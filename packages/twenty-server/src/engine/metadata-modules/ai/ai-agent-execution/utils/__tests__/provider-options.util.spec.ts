import { type ModelMessage } from 'ai';

import {
  getCallLevelProviderOptions,
  getCacheProviderOptions,
  injectCacheBreakpoint,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/provider-options.util';
import {
  AI_SDK_ANTHROPIC,
  AI_SDK_AZURE,
  AI_SDK_BEDROCK,
  AI_SDK_OPENAI,
} from 'src/engine/metadata-modules/ai/ai-models/constants/ai-sdk-package.const';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';

const BEDROCK_CLAUDE = {
  sdkPackage: AI_SDK_BEDROCK,
  modelFamily: ModelFamily.CLAUDE,
};

describe('provider-options.util', () => {
  describe('getCallLevelProviderOptions', () => {
    it('returns cache provider options for Anthropic models', () => {
      expect(
        getCallLevelProviderOptions({ sdkPackage: AI_SDK_ANTHROPIC }),
      ).toEqual({
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      });
    });

    it('keeps the thinking config the executor passes for Anthropic', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_ANTHROPIC,
          providerOptions: { anthropic: { thinking: { type: 'adaptive' } } },
        }),
      ).toEqual({
        anthropic: {
          thinking: { type: 'adaptive' },
          cacheControl: { type: 'ephemeral' },
        },
      });
    });

    it('keeps existing OpenAI options alongside store false', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_OPENAI,
          providerOptions: { openai: { reasoningEffort: 'high' } },
          promptCacheKey: 'thread-123',
        }),
      ).toEqual({
        openai: {
          reasoningEffort: 'high',
          store: false,
          promptCacheKey: 'thread-123',
        },
      });
    });

    it('keeps existing Azure options alongside store false', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_AZURE,
          providerOptions: { azure: { reasoningEffort: 'high' } },
        }),
      ).toEqual({
        azure: { reasoningEffort: 'high', store: false },
      });
    });

    it('merges existing provider options with call-level options', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_OPENAI,
          providerOptions: {
            xai: {
              searchParameters: { mode: 'auto' },
            },
          },
        }),
      ).toEqual({
        xai: {
          searchParameters: { mode: 'auto' },
        },
        openai: {
          store: false,
        },
      });
    });

    it('returns store false for OpenAI models', () => {
      expect(
        getCallLevelProviderOptions({ sdkPackage: AI_SDK_OPENAI }),
      ).toEqual({
        openai: {
          store: false,
        },
      });
    });

    it('includes promptCacheKey for OpenAI when provided', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_OPENAI,
          promptCacheKey: 'thread-123',
        }),
      ).toEqual({
        openai: {
          store: false,
          promptCacheKey: 'thread-123',
        },
      });
    });

    it('returns store false for Azure models', () => {
      expect(getCallLevelProviderOptions({ sdkPackage: AI_SDK_AZURE })).toEqual(
        {
          azure: {
            store: false,
          },
        },
      );
    });

    it('merges existing provider options with Azure store false', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_AZURE,
          providerOptions: {
            xai: {
              searchParameters: { mode: 'auto' },
            },
          },
        }),
      ).toEqual({
        xai: {
          searchParameters: { mode: 'auto' },
        },
        azure: {
          store: false,
        },
      });
    });

    it('omits promptCacheKey for non-OpenAI providers', () => {
      expect(
        getCallLevelProviderOptions({
          sdkPackage: AI_SDK_ANTHROPIC,
          promptCacheKey: 'thread-123',
        }),
      ).toEqual({
        anthropic: {
          cacheControl: { type: 'ephemeral' },
        },
      });
    });
  });

  describe('getCacheProviderOptions', () => {
    it('returns cache point provider options for Bedrock Claude models', () => {
      expect(getCacheProviderOptions(BEDROCK_CLAUDE)).toEqual({
        bedrock: {
          cachePoint: { type: 'default' },
        },
      });
    });

    it('returns no cache point for Bedrock models that do not support it', () => {
      expect(
        getCacheProviderOptions({
          sdkPackage: AI_SDK_BEDROCK,
          modelFamily: ModelFamily.GPT,
        }),
      ).toBeUndefined();
    });
  });

  describe('injectCacheBreakpoint', () => {
    it('injects cache provider options on the last message only', () => {
      expect(
        injectCacheBreakpoint(
          [
            { role: 'user', content: 'first' },
            {
              role: 'user',
              content: 'last',
              providerOptions: {
                openai: {
                  store: false,
                },
              },
            },
          ],
          BEDROCK_CLAUDE,
        ),
      ).toEqual([
        { role: 'user', content: 'first' },
        {
          role: 'user',
          content: 'last',
          providerOptions: {
            openai: {
              store: false,
            },
            bedrock: {
              cachePoint: { type: 'default' },
            },
          },
        },
      ]);
    });

    it('moves the cache point off earlier messages that already carry one', () => {
      expect(
        injectCacheBreakpoint(
          [
            {
              role: 'user',
              content: 'first',
              providerOptions: { bedrock: { cachePoint: { type: 'default' } } },
            },
            {
              role: 'tool',
              content: [],
              providerOptions: { bedrock: { cachePoint: { type: 'default' } } },
            },
            { role: 'tool', content: [] },
          ],
          BEDROCK_CLAUDE,
        ),
      ).toEqual([
        { role: 'user', content: 'first' },
        { role: 'tool', content: [] },
        {
          role: 'tool',
          content: [],
          providerOptions: { bedrock: { cachePoint: { type: 'default' } } },
        },
      ]);
    });

    it('keeps bedrock provider options other than the cache point', () => {
      expect(
        injectCacheBreakpoint(
          [
            {
              role: 'user',
              content: 'first',
              providerOptions: {
                bedrock: { cachePoint: { type: 'default' }, guardrail: 'on' },
              },
            },
            {
              role: 'user',
              content: 'last',
              providerOptions: { bedrock: { guardrail: 'off' } },
            },
          ],
          BEDROCK_CLAUDE,
        ),
      ).toEqual([
        {
          role: 'user',
          content: 'first',
          providerOptions: { bedrock: { guardrail: 'on' } },
        },
        {
          role: 'user',
          content: 'last',
          providerOptions: {
            bedrock: { guardrail: 'off', cachePoint: { type: 'default' } },
          },
        },
      ]);
    });

    it('leaves messages untouched for models without Bedrock cache points', () => {
      const messages: ModelMessage[] = [
        { role: 'user', content: 'first' },
        {
          role: 'user',
          content: 'last',
          providerOptions: { bedrock: { cachePoint: { type: 'default' } } },
        },
      ];

      expect(
        injectCacheBreakpoint(messages, {
          sdkPackage: AI_SDK_ANTHROPIC,
          modelFamily: ModelFamily.CLAUDE,
        }),
      ).toBe(messages);
      expect(
        injectCacheBreakpoint(messages, {
          sdkPackage: AI_SDK_BEDROCK,
          modelFamily: ModelFamily.GPT,
        }),
      ).toBe(messages);
    });
  });
});
