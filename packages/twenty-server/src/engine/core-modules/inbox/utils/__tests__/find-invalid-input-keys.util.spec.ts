import { findInvalidInputKeys } from 'src/engine/core-modules/inbox/utils/find-invalid-input-keys.util';
import { InboxItemFieldType } from 'src/engine/core-modules/inbox/enums/inbox-item-field-type.enum';

const inputSchema = [
  {
    key: 'title',
    type: InboxItemFieldType.TEXT as const,
    label: 'Title',
    isRequired: true,
  },
  { key: 'amount', type: InboxItemFieldType.NUMBER as const, label: 'Amount' },
  { key: 'notes', type: InboxItemFieldType.LONG_TEXT as const, label: 'Notes' },
  { key: 'urgent', type: InboxItemFieldType.BOOLEAN as const, label: 'Urgent' },
];

describe('findInvalidInputKeys', () => {
  it('accepts a complete input', () => {
    expect(
      findInvalidInputKeys({
        inputSchema,
        proposedInput: { title: 'Call back', amount: 3, urgent: false },
        editedInput: null,
      }),
    ).toEqual([]);
  });

  it('flags a missing or blank required field', () => {
    expect(
      findInvalidInputKeys({
        inputSchema,
        proposedInput: { title: '   ' },
        editedInput: null,
      }),
    ).toEqual(['title']);
  });

  it('flags a value of the wrong kind and reads the edited input first', () => {
    expect(
      findInvalidInputKeys({
        inputSchema,
        proposedInput: { title: 'Call back', amount: 3 },
        editedInput: { title: 'Call back', amount: '3', notes: '', urgent: '' },
      }),
    ).toEqual(['amount', 'urgent']);
  });
});
