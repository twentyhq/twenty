import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';

describe('parseEmailRecipients', () => {
  it('should parse a bare email address', () => {
    expect(parseEmailRecipients('jane@example.com')).toEqual([
      { address: 'jane@example.com', displayName: undefined },
    ]);
  });

  it('should parse a display name with angle brackets', () => {
    expect(parseEmailRecipients('Jane Doe <jane@example.com>')).toEqual([
      { address: 'jane@example.com', displayName: 'Jane Doe' },
    ]);
  });

  it('should parse a quoted display name containing a comma', () => {
    expect(
      parseEmailRecipients('"Doe, Jane" <jane@example.com>, bob@example.com'),
    ).toEqual([
      { address: 'jane@example.com', displayName: 'Doe, Jane' },
      { address: 'bob@example.com', displayName: undefined },
    ]);
  });

  it('should parse comma separated addresses', () => {
    expect(parseEmailRecipients('a@example.com, b@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should parse semicolon separated addresses', () => {
    expect(parseEmailRecipients('a@example.com; b@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should parse newline separated addresses', () => {
    expect(parseEmailRecipients('a@example.com\nb@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should skip empty entries between separators', () => {
    expect(parseEmailRecipients('a@example.com,, ,b@example.com')).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should flatten address groups', () => {
    expect(
      parseEmailRecipients('Friends: a@example.com, b@example.com;'),
    ).toEqual([
      { address: 'a@example.com', displayName: undefined },
      { address: 'b@example.com', displayName: undefined },
    ]);
  });

  it('should return an empty list for empty groups', () => {
    expect(parseEmailRecipients('undisclosed-recipients:;')).toEqual([]);
  });

  it('should return an empty list for whitespace only input', () => {
    expect(parseEmailRecipients('   ')).toEqual([]);
  });

  it('should keep an invalid address so validation can flag it', () => {
    expect(parseEmailRecipients('not-an-email')).toEqual([
      { address: 'not-an-email', displayName: undefined },
    ]);
  });
});
