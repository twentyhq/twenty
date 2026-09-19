import { buildEmailToolCallInput } from '@/inbox/tool-call-renderers/email/utils/buildEmailToolCallInput';

describe('buildEmailToolCallInput', () => {
  it('should nest recipients the way the email tool takes them', () => {
    expect(
      buildEmailToolCallInput({
        to: 'priya@northwind.com',
        cc: '',
        bcc: '',
        subject: 'Re: Duplicate charge',
        body: '<p>Hi Priya</p>',
        connectedAccountId: 'account-1',
        inReplyTo: '<message-id>',
      }),
    ).toEqual({
      recipients: { to: 'priya@northwind.com', cc: '', bcc: '' },
      subject: 'Re: Duplicate charge',
      body: '<p>Hi Priya</p>',
      connectedAccountId: 'account-1',
      inReplyTo: '<message-id>',
    });
  });

  it('should leave blank optionals out so the tool applies its defaults', () => {
    const input = buildEmailToolCallInput({
      to: 'a@example.com',
      cc: '',
      bcc: '',
      subject: '',
      body: '',
      connectedAccountId: '',
      fromHandle: undefined,
      inReplyTo: '',
    });

    expect(input).not.toHaveProperty('connectedAccountId');
    expect(input).not.toHaveProperty('fromHandle');
    expect(input).not.toHaveProperty('inReplyTo');
  });
});
