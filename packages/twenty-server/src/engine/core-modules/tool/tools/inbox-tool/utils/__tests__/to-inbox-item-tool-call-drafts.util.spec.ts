import { toInboxItemToolCallDrafts } from 'src/engine/core-modules/tool/tools/inbox-tool/utils/to-inbox-item-tool-call-drafts.util';
import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';

describe('toInboxItemToolCallDrafts', () => {
  it('should read a field per input key off the values', () => {
    const [draft] = toInboxItemToolCallDrafts([
      {
        toolName: 'update_opportunity',
        label: 'Update opportunity',
        input: {
          stage: 'PROPOSAL',
          amount: 24000,
          isRenewal: true,
          closingNotes:
            'A note that runs on for long enough to need a larger box than a single line would give it',
        },
      },
    ]);

    expect(draft.inputSchema).toEqual([
      { key: 'stage', label: 'Stage', type: InboxItemFieldType.TEXT },
      { key: 'amount', label: 'Amount', type: InboxItemFieldType.NUMBER },
      {
        key: 'isRenewal',
        label: 'Is renewal',
        type: InboxItemFieldType.BOOLEAN,
      },
      {
        key: 'closingNotes',
        label: 'Closing notes',
        type: InboxItemFieldType.LONG_TEXT,
      },
    ]);
    expect(draft.proposedInput).toEqual({
      stage: 'PROPOSAL',
      amount: 24000,
      isRenewal: true,
      closingNotes:
        'A note that runs on for long enough to need a larger box than a single line would give it',
    });
  });

  it('should drop nulls and ask for required keys the agent left out', () => {
    const [draft] = toInboxItemToolCallDrafts([
      {
        toolName: 'send_email',
        label: 'Send email',
        input: { to: 'marie@google.com', cc: null },
        requiredInputKeys: ['to', 'body', 'body'],
      },
    ]);

    expect(draft.inputSchema).toEqual([
      {
        key: 'to',
        label: 'To',
        type: InboxItemFieldType.TEXT,
        isRequired: true,
      },
      {
        key: 'body',
        label: 'Body',
        type: InboxItemFieldType.TEXT,
        isRequired: true,
      },
    ]);
    expect(draft.proposedInput).toEqual({ to: 'marie@google.com' });
  });

  it('should type a key the agent left out from the types it declared', () => {
    const [draft] = toInboxItemToolCallDrafts([
      {
        toolName: 'create_invoice',
        label: 'Create invoice',
        input: { companyName: 'Google' },
        requiredInputKeys: ['companyName', 'amount', 'isPaid', 'terms'],
        inputFieldTypes: {
          amount: InboxItemFieldType.NUMBER,
          isPaid: InboxItemFieldType.BOOLEAN,
          terms: InboxItemFieldType.LONG_TEXT,
        },
      },
    ]);

    expect(draft.inputSchema).toEqual([
      {
        key: 'companyName',
        label: 'Company name',
        type: InboxItemFieldType.TEXT,
        isRequired: true,
      },
      {
        key: 'amount',
        label: 'Amount',
        type: InboxItemFieldType.NUMBER,
        isRequired: true,
      },
      {
        key: 'isPaid',
        label: 'Is paid',
        type: InboxItemFieldType.BOOLEAN,
        isRequired: true,
      },
      {
        key: 'terms',
        label: 'Terms',
        type: InboxItemFieldType.LONG_TEXT,
        isRequired: true,
      },
    ]);
  });
});
