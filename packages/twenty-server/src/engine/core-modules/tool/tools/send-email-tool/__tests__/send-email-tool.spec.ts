import { parseCommaSeparatedEmails } from 'src/engine/core-modules/tool/tools/send-email-tool/utils/parse-comma-separated-emails.util';

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

describe('SendEmailTool - normalizeRecipients', () => {
  const parseCommaSeparatedEmails = (value: string | undefined): string[] => {
    if (!value) return [];

    return value
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
  };

  const normalizeRecipients = (params: {
    email?: string;
    recipients?: { to?: string; cc?: string; bcc?: string };
  }): { to: string[]; cc: string[]; bcc: string[] } | null => {
    if (params.recipients?.to?.trim()) {
      return {
        to: parseCommaSeparatedEmails(params.recipients.to),
        cc: parseCommaSeparatedEmails(params.recipients.cc),
        bcc: parseCommaSeparatedEmails(params.recipients.bcc),
      };
    }
    if (params.email) {
      return { to: [params.email], cc: [], bcc: [] };
    }

    return null;
  };

  it('should normalize comma-separated recipients to arrays', () => {
    expect(
      normalizeRecipients({
        recipients: {
          to: 'a@test.com, b@test.com',
          cc: 'cc@test.com',
          bcc: 'bcc1@test.com, bcc2@test.com',
        },
      }),
    ).toEqual({
      to: ['a@test.com', 'b@test.com'],
      cc: ['cc@test.com'],
      bcc: ['bcc1@test.com', 'bcc2@test.com'],
    });
  });

  it('should fallback to legacy email field when recipients.to is empty', () => {
    expect(
      normalizeRecipients({
        email: 'fallback@test.com',
        recipients: { to: '', cc: 'cc@test.com' },
      }),
    ).toEqual({
      to: ['fallback@test.com'],
      cc: [],
      bcc: [],
    });
  });

  it('should return null when no recipients specified', () => {
    expect(normalizeRecipients({})).toBeNull();
    expect(normalizeRecipients({ recipients: {} })).toBeNull();
  });
});

describe('SendEmailTool - workflow variable detection', () => {
  const isWorkflowVariable = (value: string): boolean => {
    const variablePattern = /{{[^{}]+}}/;

    return variablePattern.test(value);
  };

  it('should detect workflow variables', () => {
    expect(isWorkflowVariable('{{user.email}}')).toBe(true);
    expect(isWorkflowVariable('{{trigger.record.email}}')).toBe(true);
    expect(isWorkflowVariable('{{step.output.value}}')).toBe(true);
  });

  it('should not detect regular email addresses as workflow variables', () => {
    expect(isWorkflowVariable('test@example.com')).toBe(false);
    expect(isWorkflowVariable('user+tag@domain.com')).toBe(false);
  });

  it('should not detect partial or malformed variables', () => {
    expect(isWorkflowVariable('{{incomplete')).toBe(false);
    expect(isWorkflowVariable('incomplete}}')).toBe(false);
    expect(isWorkflowVariable('hello {{user.email}} world')).toBe(true);
  });
});
