import { validate } from 'class-validator';

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
