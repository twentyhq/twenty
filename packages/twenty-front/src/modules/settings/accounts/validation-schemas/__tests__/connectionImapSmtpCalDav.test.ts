import {
  getConnectionImapSmtpCalDavSchema,
  getConnectionImapSmtpCalDavUpdateSchema,
} from '@/settings/accounts/validation-schemas/connectionImapSmtpCalDav';

describe('connectionImapSmtpCalDav', () => {
  describe('getConnectionImapSmtpCalDavSchema', () => {
    it('should trim leading and trailing whitespace from host and username', () => {
      const schema = getConnectionImapSmtpCalDavSchema();

      const input = {
        name: '  Work Account  ',
        handle: 'user@example.com',
        IMAP: {
          host: '  imap.example.com  ',
          port: 993,
          username: '  user@example.com  ',
          password: 'password123',
          connectionSecurity: 'SSL_TLS' as const,
        },
      };

      const result = schema.parse(input);

      expect(result.name).toBe('Work Account');
      expect(result.IMAP?.host).toBe('imap.example.com');
      expect(result.IMAP?.username).toBe('user@example.com');
      expect(result.IMAP?.password).toBe('password123');
    });

    it('should preserve whitespace inside passwords', () => {
      const schema = getConnectionImapSmtpCalDavSchema();

      const input = {
        name: 'Work Account',
        handle: 'user@example.com',
        SMTP: {
          host: 'smtp.example.com',
          port: 587,
          password: '  pass word  ',
          connectionSecurity: 'STARTTLS' as const,
        },
      };

      const result = schema.parse(input);

      expect(result.SMTP?.password).toBe('  pass word  ');
    });
  });

  describe('getConnectionImapSmtpCalDavUpdateSchema', () => {
    it('should trim leading and trailing whitespace on update', () => {
      const schema = getConnectionImapSmtpCalDavUpdateSchema();

      const input = {
        name: '  Updated Account  ',
        handle: 'user@example.com',
        CALDAV: {
          host: '  caldav.example.com  ',
          port: 443,
          username: '  caldav-user  ',
          connectionSecurity: 'SSL_TLS' as const,
        },
      };

      const result = schema.parse(input);

      expect(result.name).toBe('Updated Account');
      expect(result.CALDAV?.host).toBe('caldav.example.com');
      expect(result.CALDAV?.username).toBe('caldav-user');
    });
  });
});
