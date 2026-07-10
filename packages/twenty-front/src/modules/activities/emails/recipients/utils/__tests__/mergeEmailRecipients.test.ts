import { mergeEmailRecipients } from '@/activities/emails/recipients/utils/mergeEmailRecipients';

describe('mergeEmailRecipients', () => {
  it('should append incoming recipients at the end', () => {
    const { nextRecipients, duplicateChipKey } = mergeEmailRecipients({
      recipients: [{ address: 'a@example.com' }],
      incomingRecipients: [
        { address: 'b@example.com', displayName: 'Bee' },
        { address: 'c@example.com' },
      ],
      replacedIndex: null,
    });

    expect(nextRecipients).toEqual([
      { address: 'a@example.com' },
      { address: 'b@example.com', displayName: 'Bee' },
      { address: 'c@example.com' },
    ]);
    expect(duplicateChipKey).toBeNull();
  });

  it('should skip a case-insensitive duplicate and report its chip key', () => {
    const { nextRecipients, duplicateChipKey } = mergeEmailRecipients({
      recipients: [{ address: 'jane@example.com' }],
      incomingRecipients: [{ address: 'JANE@example.com' }],
      replacedIndex: null,
    });

    expect(nextRecipients).toEqual([{ address: 'jane@example.com' }]);
    expect(duplicateChipKey).toBe('jane@example.com');
  });

  it('should upgrade the display name of an existing recipient when the duplicate carries one', () => {
    const { nextRecipients } = mergeEmailRecipients({
      recipients: [
        { address: 'jane@example.com' },
        { address: 'john@example.com', displayName: 'John' },
      ],
      incomingRecipients: [
        { address: 'jane@example.com', displayName: 'Jane Doe' },
        { address: 'john@example.com', displayName: 'Johnny' },
      ],
      replacedIndex: null,
    });

    expect(nextRecipients).toEqual([
      { address: 'jane@example.com', displayName: 'Jane Doe' },
      { address: 'john@example.com', displayName: 'John' },
    ]);
  });

  it('should replace the recipient at replacedIndex in place', () => {
    const { nextRecipients } = mergeEmailRecipients({
      recipients: [{ address: 'a@example.com' }, { address: 'b@example.com' }],
      incomingRecipients: [{ address: 'c@example.com' }],
      replacedIndex: 0,
    });

    expect(nextRecipients).toEqual([
      { address: 'c@example.com' },
      { address: 'b@example.com' },
    ]);
  });

  it('should delete the replaced recipient when nothing comes in', () => {
    const { nextRecipients } = mergeEmailRecipients({
      recipients: [{ address: 'a@example.com' }, { address: 'b@example.com' }],
      incomingRecipients: [],
      replacedIndex: 0,
    });

    expect(nextRecipients).toEqual([{ address: 'b@example.com' }]);
  });

  it('should dedupe recipients within the incoming batch', () => {
    const { nextRecipients, duplicateChipKey } = mergeEmailRecipients({
      recipients: [],
      incomingRecipients: [
        { address: 'jane@example.com' },
        { address: 'Jane@Example.com', displayName: 'Jane Doe' },
      ],
      replacedIndex: null,
    });

    expect(nextRecipients).toEqual([
      { address: 'jane@example.com', displayName: 'Jane Doe' },
    ]);
    expect(duplicateChipKey).toBe('jane@example.com');
  });

  it('should not mutate the given recipients array', () => {
    const recipients = [{ address: 'jane@example.com' }];

    mergeEmailRecipients({
      recipients,
      incomingRecipients: [
        { address: 'jane@example.com', displayName: 'Jane Doe' },
      ],
      replacedIndex: null,
    });

    expect(recipients).toEqual([{ address: 'jane@example.com' }]);
  });
});
