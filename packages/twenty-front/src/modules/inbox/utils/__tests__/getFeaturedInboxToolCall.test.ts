import { getFeaturedInboxToolCall } from '@/inbox/utils/getFeaturedInboxToolCall';
import {
  type InboxItemToolCall,
  InboxItemToolCallStatus,
} from '~/generated/graphql';

const buildToolCall = (
  overrides: Partial<InboxItemToolCall> & Pick<InboxItemToolCall, 'id'>,
): InboxItemToolCall =>
  ({
    toolName: 'create_task',
    label: 'Create task',
    status: InboxItemToolCallStatus.PROPOSED,
    position: 0,
    proposedInput: {},
    inputSchema: [],
    ...overrides,
  }) as InboxItemToolCall;

describe('getFeaturedInboxToolCall', () => {
  it('should feature the first open call whose tool has a surface', () => {
    const toolCalls = [
      buildToolCall({ id: 'task' }),
      buildToolCall({
        id: 'sent',
        toolName: 'send_email',
        status: InboxItemToolCallStatus.EXECUTED,
      }),
      buildToolCall({ id: 'reply', toolName: 'send_email' }),
      buildToolCall({ id: 'second-reply', toolName: 'send_email' }),
    ];

    expect(getFeaturedInboxToolCall(toolCalls)?.id).toBe('reply');
  });

  it('should feature a failed call so it can be fixed and sent again', () => {
    const toolCalls = [
      buildToolCall({
        id: 'failed',
        toolName: 'send_email',
        status: InboxItemToolCallStatus.FAILED,
      }),
    ];

    expect(getFeaturedInboxToolCall(toolCalls)?.id).toBe('failed');
  });

  it('should feature nothing when no open call has a surface', () => {
    const toolCalls = [
      buildToolCall({ id: 'task' }),
      buildToolCall({
        id: 'skipped',
        toolName: 'send_email',
        status: InboxItemToolCallStatus.REJECTED,
      }),
    ];

    expect(getFeaturedInboxToolCall(toolCalls)).toBeNull();
  });
});
