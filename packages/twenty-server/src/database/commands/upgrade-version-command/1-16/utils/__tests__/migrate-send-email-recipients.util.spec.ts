import {
  arrayToCommaSeparatedString,
  type LegacySendEmailInput,
  migrateSendEmailInput,
  needsSendEmailMigration,
} from 'src/database/commands/upgrade-version-command/1-16/utils/migrate-send-email-recipients.util';

describe('migrate-send-email-recipients.util', () => {
  describe('arrayToCommaSeparatedString', () => {
    it('should return empty string for undefined', () => {
      expect(arrayToCommaSeparatedString(undefined)).toBe('');
    });

    it('should return the string as-is when given a string', () => {
      expect(arrayToCommaSeparatedString('test@example.com')).toBe(
        'test@example.com',
      );
    });

    it('should join array elements with comma and space', () => {
      expect(
        arrayToCommaSeparatedString(['a@test.com', 'b@test.com', 'c@test.com']),
      ).toBe('a@test.com, b@test.com, c@test.com');
    });

    it('should filter out empty strings from arrays', () => {
      expect(
        arrayToCommaSeparatedString(['a@test.com', '', 'b@test.com']),
      ).toBe('a@test.com, b@test.com');
    });

    it('should filter out whitespace-only strings from arrays', () => {
      expect(
        arrayToCommaSeparatedString(['a@test.com', '   ', 'b@test.com']),
      ).toBe('a@test.com, b@test.com');
    });

    it('should return empty string for empty array', () => {
      expect(arrayToCommaSeparatedString([])).toBe('');
    });
  });

  describe('needsSendEmailMigration', () => {
    it('should return true when email field is present', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        email: 'test@example.com',
        subject: 'Test',
      };

      expect(needsSendEmailMigration(input)).toBe(true);
    });

    it('should return true when recipients.to is an array', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        recipients: {
          to: ['a@test.com', 'b@test.com'],
        },
      };

      expect(needsSendEmailMigration(input)).toBe(true);
    });

    it('should return true when recipients.cc is an array', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        recipients: {
          to: 'to@test.com',
          cc: ['cc@test.com'],
        },
      };

      expect(needsSendEmailMigration(input)).toBe(true);
    });

    it('should return true when recipients.bcc is an array', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        recipients: {
          to: 'to@test.com',
          bcc: ['bcc@test.com'],
        },
      };

      expect(needsSendEmailMigration(input)).toBe(true);
    });

    it('should return false when already in new format (strings only)', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        recipients: {
          to: 'to@test.com',
          cc: 'cc@test.com',
          bcc: 'bcc@test.com',
        },
      };

      expect(needsSendEmailMigration(input)).toBe(false);
    });

    it('should return false when no email or recipients defined', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        subject: 'Test',
      };

      expect(needsSendEmailMigration(input)).toBe(false);
    });
  });

  describe('migrateSendEmailInput', () => {
    it('should migrate legacy email field to recipients.to', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        email: 'bruh@gmail.com',
        subject: 'bruh',
        body: '{"type":"doc","content":[]}',
        files: [],
      };

      const result = migrateSendEmailInput(input);

      expect(result).toEqual({
        connectedAccountId: 'acc-123',
        recipients: {
          to: 'bruh@gmail.com',
          cc: '',
          bcc: '',
        },
        subject: 'bruh',
        body: '{"type":"doc","content":[]}',
        files: [],
      });
    });

    it('should migrate array recipients to comma-separated strings', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        recipients: {
          to: ['a@test.com', 'b@test.com'],
          cc: ['cc1@test.com', 'cc2@test.com'],
          bcc: ['bcc@test.com'],
        },
        subject: 'Test',
      };

      const result = migrateSendEmailInput(input);

      expect(result).toEqual({
        connectedAccountId: 'acc-123',
        recipients: {
          to: 'a@test.com, b@test.com',
          cc: 'cc1@test.com, cc2@test.com',
          bcc: 'bcc@test.com',
        },
        subject: 'Test',
      });
    });

    it('should prefer recipients.to over email when both exist', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        email: 'legacy@test.com',
        recipients: {
          to: ['new@test.com'],
        },
      };

      const result = migrateSendEmailInput(input);

      expect(result.recipients.to).toBe('new@test.com');
    });

    it('should fallback to email when recipients.to is empty', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        email: 'fallback@test.com',
        recipients: {
          to: [],
          cc: ['cc@test.com'],
        },
      };

      const result = migrateSendEmailInput(input);

      expect(result.recipients.to).toBe('fallback@test.com');
      expect(result.recipients.cc).toBe('cc@test.com');
    });

    it('should handle the exact sample from production', () => {
      const productionInput: LegacySendEmailInput = {
        connectedAccountId: '',
        email: 'bruh@gmail.com',
        subject: 'bruh',
        body: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"bruh"}]}]}',
        files: [],
      };

      const result = migrateSendEmailInput(productionInput);

      expect(result).toEqual({
        connectedAccountId: '',
        recipients: {
          to: 'bruh@gmail.com',
          cc: '',
          bcc: '',
        },
        subject: 'bruh',
        body: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"bruh"}]}]}',
        files: [],
      });

      expect(result).not.toHaveProperty('email');
    });

    it('should preserve all other fields unchanged', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        email: 'test@test.com',
        subject: 'Subject here',
        body: 'Body content',
        files: [{ id: '1', name: 'file.pdf' }],
      };

      const result = migrateSendEmailInput(input);

      expect(result.connectedAccountId).toBe('acc-123');
      expect(result.subject).toBe('Subject here');
      expect(result.body).toBe('Body content');
      expect(result.files).toEqual([{ id: '1', name: 'file.pdf' }]);
    });

    it('should handle workflow variables in emails', () => {
      const input: LegacySendEmailInput = {
        connectedAccountId: 'acc-123',
        recipients: {
          to: ['{{trigger.record.email}}', 'static@test.com'],
          cc: ['{{user.email}}'],
        },
      };

      const result = migrateSendEmailInput(input);

      expect(result.recipients.to).toBe(
        '{{trigger.record.email}}, static@test.com',
      );
      expect(result.recipients.cc).toBe('{{user.email}}');
    });
  });
});
