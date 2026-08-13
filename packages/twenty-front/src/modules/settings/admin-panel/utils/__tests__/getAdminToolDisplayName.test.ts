import { type AdminChatThreadMessagePart } from '@/settings/admin-panel/types/AdminChatThreadMessagePart';
import { getAdminToolDisplayName } from '@/settings/admin-panel/utils/getAdminToolDisplayName';

const buildPart = (
  part: Partial<AdminChatThreadMessagePart>,
): AdminChatThreadMessagePart =>
  ({
    type: 'tool-ask_questions',
    toolName: null,
    ...part,
  }) as AdminChatThreadMessagePart;

describe('getAdminToolDisplayName', () => {
  it('should prefer the persisted tool name', () => {
    expect(
      getAdminToolDisplayName(buildPart({ toolName: 'ask_questions' })),
    ).toBe('ask_questions');
  });

  it('should strip the tool prefix from the part type', () => {
    expect(getAdminToolDisplayName(buildPart({}))).toBe('ask_questions');
  });

  it('should fall back to the raw type', () => {
    expect(getAdminToolDisplayName(buildPart({ type: 'dynamic-tool' }))).toBe(
      'dynamic-tool',
    );
  });
});
