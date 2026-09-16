import { getEmailComposerPrefillFromToolCall } from '@/inbox/tool-call-renderers/email/utils/getEmailComposerPrefillFromToolCall';

describe('getEmailComposerPrefillFromToolCall', () => {
  it('should read nested recipients and the optional sending fields', () => {
    expect(
      getEmailComposerPrefillFromToolCall({
        proposedInput: {
          recipients: { to: 'priya@northwind.com', cc: 'ops@northwind.com' },
          subject: 'Re: Duplicate charge',
          body: 'Hi Priya',
          connectedAccountId: 'account-1',
          inReplyTo: '<message-id>',
        },
        editedInput: null,
      }),
    ).toEqual({
      to: 'priya@northwind.com',
      cc: 'ops@northwind.com',
      bcc: '',
      subject: 'Re: Duplicate charge',
      body: 'Hi Priya',
      connectedAccountId: 'account-1',
      fromHandle: undefined,
      inReplyTo: '<message-id>',
    });
  });

  it('should prefer what the person edited over what was proposed', () => {
    expect(
      getEmailComposerPrefillFromToolCall({
        proposedInput: { recipients: { to: 'a@example.com' }, body: 'draft' },
        editedInput: { recipients: { to: 'b@example.com' }, body: 'edited' },
      }),
    ).toMatchObject({ to: 'b@example.com', body: 'edited' });
  });

  it('should read recipients placed at the top level', () => {
    expect(
      getEmailComposerPrefillFromToolCall({
        proposedInput: { to: 'a@example.com', subject: 'Hello' },
        editedInput: null,
      }),
    ).toMatchObject({ to: 'a@example.com', subject: 'Hello' });
  });

  it('should carry a structured body as its JSON', () => {
    const document = { type: 'doc', content: [] };

    expect(
      getEmailComposerPrefillFromToolCall({
        proposedInput: { body: document },
        editedInput: null,
      }).body,
    ).toBe(JSON.stringify(document));
  });

  it('should leave a blank optional out rather than pass an empty string', () => {
    expect(
      getEmailComposerPrefillFromToolCall({
        proposedInput: { connectedAccountId: '' },
        editedInput: null,
      }).connectedAccountId,
    ).toBeUndefined();
  });
});
