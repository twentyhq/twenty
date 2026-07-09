import { mergeEmailRecipients } from '@/activities/emails/recipients/utils/mergeEmailRecipients';

describe('mergeEmailRecipients', () => {
  it('should append unique recipients at the given index', () => {
    const { mergedRecipients, duplicateKeys } = mergeEmailRecipients(
      [{ address: 'a@example.com' }],
      [{ address: 'b@example.com' }],
      1,
    );

    expect(mergedRecipients).toEqual([
      { address: 'a@example.com' },
      { address: 'b@example.com' },
    ]);
    expect(duplicateKeys).toEqual([]);
  });

  it('should insert at an arbitrary position', () => {
    const { mergedRecipients } = mergeEmailRecipients(
      [{ address: 'a@example.com' }, { address: 'c@example.com' }],
      [{ address: 'b@example.com' }],
      1,
    );

    expect(mergedRecipients.map((recipient) => recipient.address)).toEqual([
      'a@example.com',
      'b@example.com',
      'c@example.com',
    ]);
  });

  it('should report duplicates case-insensitively and keep the existing entry', () => {
    const { mergedRecipients, duplicateKeys } = mergeEmailRecipients(
      [{ address: 'jane@example.com' }],
      [{ address: 'Jane@Example.com' }],
      1,
    );

    expect(mergedRecipients).toEqual([{ address: 'jane@example.com' }]);
    expect(duplicateKeys).toEqual(['jane@example.com']);
  });

  it('should upgrade the display name of an existing recipient from a duplicate', () => {
    const { mergedRecipients } = mergeEmailRecipients(
      [{ address: 'jane@example.com' }],
      [{ address: 'jane@example.com', displayName: 'Jane Doe' }],
      1,
    );

    expect(mergedRecipients).toEqual([
      { address: 'jane@example.com', displayName: 'Jane Doe' },
    ]);
  });

  it('should not overwrite an existing display name', () => {
    const { mergedRecipients } = mergeEmailRecipients(
      [{ address: 'jane@example.com', displayName: 'Jane' }],
      [{ address: 'jane@example.com', displayName: 'Someone Else' }],
      1,
    );

    expect(mergedRecipients).toEqual([
      { address: 'jane@example.com', displayName: 'Jane' },
    ]);
  });

  it('should dedupe within the added batch itself', () => {
    const { mergedRecipients, duplicateKeys } = mergeEmailRecipients(
      [],
      [{ address: 'a@example.com' }, { address: 'A@example.com' }],
      0,
    );

    expect(mergedRecipients).toEqual([{ address: 'a@example.com' }]);
    expect(duplicateKeys).toEqual(['a@example.com']);
  });

  it('should upgrade a display name from a later duplicate within the batch', () => {
    const { mergedRecipients } = mergeEmailRecipients(
      [],
      [
        { address: 'a@example.com' },
        { address: 'A@example.com', displayName: 'Aline' },
      ],
      0,
    );

    expect(mergedRecipients).toEqual([
      { address: 'a@example.com', displayName: 'Aline' },
    ]);
  });
});
