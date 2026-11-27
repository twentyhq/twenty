import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { WORKSPACE_DISPLAY_NAME_MAX_LENGTH } from 'twenty-shared/constants';

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

describe('workspace assistant profile inputs', () => {
  it('rejects an explicitly null profile', async () => {
    const input = Object.assign(new UpdateWorkspaceInput(), {
      aiChatAssistantProfile: null,
    });

    expect(await validate(input)).toEqual([
      expect.objectContaining({ property: 'aiChatAssistantProfile' }),
    ]);
  });
});

describe('workspace display name', () => {
  const validateDisplayName = (displayName: string) =>
    validate(plainToInstance(UpdateWorkspaceInput, { displayName }));

  it('accepts a name at the limit with surrounding whitespace', async () => {
    expect(
      await validateDisplayName(
        `  ${'a'.repeat(WORKSPACE_DISPLAY_NAME_MAX_LENGTH)}  `,
      ),
    ).toEqual([]);
  });

  it('counts characters rather than UTF-16 code units', async () => {
    expect(
      await validateDisplayName('😀'.repeat(WORKSPACE_DISPLAY_NAME_MAX_LENGTH)),
    ).toEqual([]);
  });

  it('rejects a name over the limit', async () => {
    expect(
      await validateDisplayName(
        'a'.repeat(WORKSPACE_DISPLAY_NAME_MAX_LENGTH + 1),
      ),
    ).toEqual([expect.objectContaining({ property: 'displayName' })]);
  });
});
