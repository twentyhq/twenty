import { InboxEmailToolCallEditor } from '@/inbox/tool-call-renderers/email/components/InboxEmailToolCallEditor';
import { InboxEmailToolCallSurface } from '@/inbox/tool-call-renderers/email/components/InboxEmailToolCallSurface';
import { getInboxToolCallRenderer } from '@/inbox/tool-call-renderers/utils/getInboxToolCallRenderer';
import { getInboxToolCallStarters } from '@/inbox/tool-call-renderers/utils/getInboxToolCallStarters';

describe('getInboxToolCallRenderer', () => {
  it('should give the email tool the composer as a row editor', () => {
    expect(getInboxToolCallRenderer('send_email')?.Editor).toBe(
      InboxEmailToolCallEditor,
    );
  });

  it('should let the email tool take the body of the pane', () => {
    expect(getInboxToolCallRenderer('send_email')?.Surface).toBe(
      InboxEmailToolCallSurface,
    );
  });

  it('should say what running the email tool does', () => {
    expect(getInboxToolCallRenderer('send_email')?.runLabel()).toBe('Send');
  });

  // Anything else falls back to the schema form, which the caller owns.
  it('should return nothing for a tool with no renderer of its own', () => {
    expect(getInboxToolCallRenderer('create_task')).toBeUndefined();
  });
});

describe('getInboxToolCallStarters', () => {
  it('should offer a reply from a message thread', () => {
    const starters = getInboxToolCallStarters('messageThread');

    expect(starters.map((entry) => entry.toolName)).toEqual(['send_email']);
    expect(starters[0].starter.label()).toBe('Reply...');
  });

  it('should offer nothing from an object no tool starts from', () => {
    expect(getInboxToolCallStarters('company')).toEqual([]);
  });
});
