import {
  type EmailRecipientsByFieldId,
  moveEmailRecipientsBetweenFields,
} from '@/activities/emails/recipients/utils/moveEmailRecipientsBetweenFields';

const buildRecipientsByFieldId = (
  overrides: Partial<EmailRecipientsByFieldId> = {},
): EmailRecipientsByFieldId => ({
  to: [],
  cc: [],
  bcc: [],
  ...overrides,
});

const addresses = (recipients: { address: string }[]) =>
  recipients.map((recipient) => recipient.address);

describe('moveEmailRecipientsBetweenFields', () => {
  it('should move a chip to the end of its own field', () => {
    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId: buildRecipientsByFieldId({
        to: [
          { address: 'a@x.com' },
          { address: 'b@x.com' },
          { address: 'c@x.com' },
        ],
      }),
      sourceFieldId: 'to',
      movedIndices: [0],
      destinationFieldId: 'to',
      destinationIndex: 3,
    });

    expect(addresses(result.to)).toEqual(['b@x.com', 'c@x.com', 'a@x.com']);
  });

  it('should move a chip backwards inside its own field', () => {
    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId: buildRecipientsByFieldId({
        to: [
          { address: 'a@x.com' },
          { address: 'b@x.com' },
          { address: 'c@x.com' },
        ],
      }),
      sourceFieldId: 'to',
      movedIndices: [2],
      destinationFieldId: 'to',
      destinationIndex: 0,
    });

    expect(addresses(result.to)).toEqual(['c@x.com', 'a@x.com', 'b@x.com']);
  });

  it('should leave the order untouched when dropping a chip back in place', () => {
    const recipientsByFieldId = buildRecipientsByFieldId({
      to: [{ address: 'a@x.com' }, { address: 'b@x.com' }],
    });

    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId,
      sourceFieldId: 'to',
      movedIndices: [0],
      destinationFieldId: 'to',
      destinationIndex: 1,
    });

    expect(addresses(result.to)).toEqual(['a@x.com', 'b@x.com']);
  });

  it('should keep a multi-chip selection contiguous and ordered when reordering', () => {
    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId: buildRecipientsByFieldId({
        to: [
          { address: 'a@x.com' },
          { address: 'b@x.com' },
          { address: 'c@x.com' },
          { address: 'd@x.com' },
        ],
      }),
      sourceFieldId: 'to',
      movedIndices: [0, 2],
      destinationFieldId: 'to',
      destinationIndex: 4,
    });

    expect(addresses(result.to)).toEqual([
      'b@x.com',
      'd@x.com',
      'a@x.com',
      'c@x.com',
    ]);
  });

  it('should move a chip from To to Cc at the drop position', () => {
    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId: buildRecipientsByFieldId({
        to: [{ address: 'a@x.com' }, { address: 'b@x.com' }],
        cc: [{ address: 'c@x.com' }],
      }),
      sourceFieldId: 'to',
      movedIndices: [0],
      destinationFieldId: 'cc',
      destinationIndex: 0,
    });

    expect(addresses(result.to)).toEqual(['b@x.com']);
    expect(addresses(result.cc)).toEqual(['a@x.com', 'c@x.com']);
    expect(result.bcc).toEqual([]);
  });

  it('should move a whole selection from To to Bcc', () => {
    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId: buildRecipientsByFieldId({
        to: [
          { address: 'a@x.com' },
          { address: 'b@x.com' },
          { address: 'c@x.com' },
        ],
      }),
      sourceFieldId: 'to',
      movedIndices: [0, 2],
      destinationFieldId: 'bcc',
      destinationIndex: 0,
    });

    expect(addresses(result.to)).toEqual(['b@x.com']);
    expect(addresses(result.bcc)).toEqual(['a@x.com', 'c@x.com']);
  });

  it('should drop a duplicate instead of adding it twice to the destination', () => {
    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId: buildRecipientsByFieldId({
        to: [{ address: 'shared@x.com' }],
        cc: [{ address: 'shared@x.com' }],
      }),
      sourceFieldId: 'to',
      movedIndices: [0],
      destinationFieldId: 'cc',
      destinationIndex: 0,
    });

    expect(result.to).toEqual([]);
    expect(addresses(result.cc)).toEqual(['shared@x.com']);
  });

  it('should keep both copies when reordering a field that holds the same address twice', () => {
    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId: buildRecipientsByFieldId({
        to: [
          { address: 'dup@x.com' },
          { address: 'b@x.com' },
          { address: 'dup@x.com' },
        ],
      }),
      sourceFieldId: 'to',
      movedIndices: [0],
      destinationFieldId: 'to',
      destinationIndex: 3,
    });

    expect(addresses(result.to)).toEqual(['b@x.com', 'dup@x.com', 'dup@x.com']);
  });

  it('should return the original state when a drop does not change the order', () => {
    const recipientsByFieldId = buildRecipientsByFieldId({
      to: [{ address: 'a@x.com' }, { address: 'b@x.com' }],
    });

    expect(
      moveEmailRecipientsBetweenFields({
        recipientsByFieldId,
        sourceFieldId: 'to',
        movedIndices: [0],
        destinationFieldId: 'to',
        destinationIndex: 0,
      }),
    ).toBe(recipientsByFieldId);

    expect(
      moveEmailRecipientsBetweenFields({
        recipientsByFieldId,
        sourceFieldId: 'to',
        movedIndices: [0],
        destinationFieldId: 'to',
        destinationIndex: 1,
      }),
    ).toBe(recipientsByFieldId);
  });

  it('should keep the untouched field reference stable', () => {
    const recipientsByFieldId = buildRecipientsByFieldId({
      to: [{ address: 'a@x.com' }],
      bcc: [{ address: 'z@x.com' }],
    });

    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId,
      sourceFieldId: 'to',
      movedIndices: [0],
      destinationFieldId: 'cc',
      destinationIndex: 0,
    });

    expect(result.bcc).toBe(recipientsByFieldId.bcc);
  });

  it('should ignore indices that fall outside the source field', () => {
    const recipientsByFieldId = buildRecipientsByFieldId({
      to: [{ address: 'a@x.com' }],
    });

    const result = moveEmailRecipientsBetweenFields({
      recipientsByFieldId,
      sourceFieldId: 'to',
      movedIndices: [7],
      destinationFieldId: 'cc',
      destinationIndex: 0,
    });

    expect(result).toBe(recipientsByFieldId);
  });
});
