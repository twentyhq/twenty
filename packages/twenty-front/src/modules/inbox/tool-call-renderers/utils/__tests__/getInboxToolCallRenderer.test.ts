import { InboxEmailToolCallEditor } from '@/inbox/tool-call-renderers/email/components/InboxEmailToolCallEditor';
import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';

describe('getInboxToolCallRenderer', () => {
  it('should give both email tools the composer', () => {
    expect(getInboxToolCallRenderer('send_email')?.Editor).toBe(
      InboxEmailToolCallEditor,
    );
    expect(getInboxToolCallRenderer('draft_email')?.Editor).toBe(
      InboxEmailToolCallEditor,
    );
  });

  it('should say what running each email tool does', () => {
    expect(getInboxToolCallRenderer('send_email')?.runLabel()).toBe('Send');
    expect(getInboxToolCallRenderer('draft_email')?.runLabel()).toBe(
      'Save draft',
    );
  });

  // Anything else falls back to the schema form, which the caller owns.
  it('should return nothing for a tool with no renderer of its own', () => {
    expect(getInboxToolCallRenderer('create_task')).toBeUndefined();
  });
});
