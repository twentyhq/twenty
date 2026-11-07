import { EmailConnectionSecurity } from 'src/engine/core-modules/imap-smtp-caldav-connection/enums/email-connection-security.enum';
import { connectionParametersUpdateSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters-update.schema';
import { connectionParametersSchema } from 'src/engine/core-modules/imap-smtp-caldav-connection/schemas/connection-parameters.schema';

describe('connectionParametersSchema', () => {
  it('should trim leading and trailing whitespace from host and username', () => {
    const input = {
      host: '   imap.example.com   ',
      port: 993,
      username: '   user@example.com   ',
      password: 'password123',
      connectionSecurity: EmailConnectionSecurity.SSL_TLS,
    };

    const result = connectionParametersSchema.parse(input);

    expect(result.host).toBe('imap.example.com');
    expect(result.username).toBe('user@example.com');
    expect(result.password).toBe('password123');
  });

  it('should preserve whitespace in password', () => {
    const input = {
      host: 'imap.example.com',
      port: 993,
      password: '  pass word with spaces  ',
      connectionSecurity: EmailConnectionSecurity.SSL_TLS,
    };

    const result = connectionParametersSchema.parse(input);

    expect(result.password).toBe('  pass word with spaces  ');
  });

  it('should reject whitespace-only host', () => {
    const input = {
      host: '    ',
      port: 993,
      password: 'password123',
      connectionSecurity: EmailConnectionSecurity.SSL_TLS,
    };

    expect(() => connectionParametersSchema.parse(input)).toThrow();
  });
});

describe('connectionParametersUpdateSchema', () => {
  it('should trim leading and trailing whitespace from host and username on update', () => {
    const input = {
      host: '   smtp.example.com   ',
      port: 587,
      username: '   smtp-user   ',
      connectionSecurity: EmailConnectionSecurity.STARTTLS,
    };

    const result = connectionParametersUpdateSchema.parse(input);

    expect(result.host).toBe('smtp.example.com');
    expect(result.username).toBe('smtp-user');
    expect(result.password).toBeUndefined();
  });
});
