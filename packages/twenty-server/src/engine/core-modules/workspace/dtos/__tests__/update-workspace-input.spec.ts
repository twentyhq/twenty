import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH,
  DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
} from 'twenty-shared/ai';

import { UpdateWorkspaceInput } from 'src/engine/core-modules/workspace/dtos/update-workspace-input';
import { AiChatAssistantMode } from 'src/engine/core-modules/workspace/enums/ai-chat-assistant-mode.enum';

const ASSISTANT_MODE_FIELDS = [
  'aiChatDirectMessageAssistantMode',
  'aiChatInboxAssistantMode',
] as const;

describe('workspace assistant mode updates', () => {
  it('accepts an update that leaves both modes unchanged', async () => {
    expect(await validate(new UpdateWorkspaceInput())).toEqual([]);
  });

  it.each(Object.values(AiChatAssistantMode))(
    'accepts the %s mode in either scope',
    async (mode) => {
      for (const field of ASSISTANT_MODE_FIELDS) {
        const input = Object.assign(new UpdateWorkspaceInput(), {
          [field]: mode,
        });

        expect(await validate(input)).toEqual([]);
      }
    },
  );

  it.each([null, 'PROACTIVE'])(
    'rejects the invalid mode %s in either scope',
    async (mode) => {
      for (const field of ASSISTANT_MODE_FIELDS) {
        const input = Object.assign(new UpdateWorkspaceInput(), {
          [field]: mode,
        });

        expect(await validate(input)).toEqual([
          expect.objectContaining({ property: field }),
        ]);
      }
    },
  );
});

describe('workspace assistant profile updates', () => {
  it('accepts omitted fields, partial edits and a complete reset', async () => {
    for (const update of [
      {},
      { aiChatAssistantAvatarShape: 'cloud' },
      { isAiChatAssistantAvatarAnimated: false },
      DEFAULT_AI_CHAT_ASSISTANT_PROFILE,
    ]) {
      expect(
        await validate(plainToInstance(UpdateWorkspaceInput, update)),
      ).toEqual([]);
    }
  });

  it('validates the trimmed display name', async () => {
    const input = plainToInstance(UpdateWorkspaceInput, {
      aiChatAssistantDisplayName: `  ${'A'.repeat(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH)}  `,
    });

    expect(await validate(input)).toEqual([]);
    expect(input.aiChatAssistantDisplayName).toBe(
      'A'.repeat(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH),
    );
  });

  it.each([
    { field: 'aiChatAssistantDisplayName', value: null },
    { field: 'aiChatAssistantDisplayName', value: '   ' },
    {
      field: 'aiChatAssistantDisplayName',
      value: 'A'.repeat(AI_CHAT_ASSISTANT_DISPLAY_NAME_MAX_LENGTH + 1),
    },
    { field: 'aiChatAssistantDisplayName', value: 42 },
    { field: 'aiChatAssistantAvatarShape', value: null },
    { field: 'aiChatAssistantAvatarShape', value: 'square' },
    { field: 'aiChatAssistantAvatarColor', value: null },
    { field: 'aiChatAssistantAvatarColor', value: 'violet' },
    { field: 'aiChatAssistantAvatarFace', value: null },
    { field: 'aiChatAssistantAvatarFace', value: 'angry' },
    { field: 'isAiChatAssistantAvatarAnimated', value: null },
    { field: 'isAiChatAssistantAvatarAnimated', value: 'true' },
  ])('rejects invalid $field input $value', async ({ field, value }) => {
    const input = plainToInstance(UpdateWorkspaceInput, { [field]: value });

    expect(await validate(input)).toEqual([
      expect.objectContaining({ property: field }),
    ]);
  });
});
