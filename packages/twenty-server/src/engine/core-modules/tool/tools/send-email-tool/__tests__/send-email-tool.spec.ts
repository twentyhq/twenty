import { parseCommaSeparatedEmails } from 'src/engine/core-modules/tool/tools/email-tool/utils/parse-comma-separated-emails.util';

describe('SendEmailTool - parseCommaSeparatedEmails', () => {
  it('should parse comma-separated emails into array', () => {
    expect(
      parseCommaSeparatedEmails('a@test.com, b@test.com, c@test.com'),
    ).toEqual(['a@test.com', 'b@test.com', 'c@test.com']);
  });

  it('should handle workflow variables mixed with emails', () => {
    expect(
      parseCommaSeparatedEmails(
        '{{trigger.record.email}}, static@example.com, {{user.email}}',
      ),
    ).toEqual([
      '{{trigger.record.email}}',
      'static@example.com',
      '{{user.email}}',
    ]);
  });

  it('should filter out empty entries and handle irregular spacing', () => {
    expect(
      parseCommaSeparatedEmails('  a@test.com  ,   , b@test.com,  '),
    ).toEqual(['a@test.com', 'b@test.com']);
  });

  it('should return empty array for undefined or empty input', () => {
    expect(parseCommaSeparatedEmails(undefined)).toEqual([]);
    expect(parseCommaSeparatedEmails('')).toEqual([]);
    expect(parseCommaSeparatedEmails('   ')).toEqual([]);
  });
});
