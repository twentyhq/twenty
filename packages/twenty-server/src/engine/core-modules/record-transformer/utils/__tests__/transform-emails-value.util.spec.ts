import { transformEmailsValue } from 'src/engine/core-modules/record-transformer/utils/transform-emails-value.util';

describe('transformEmailsValue', () => {
  it('should return undefined when value is undefined', () => {
    const result = transformEmailsValue(undefined);

    expect(result).toBeUndefined();
  });

  it('should return null when value is null', () => {
    const result = transformEmailsValue(null);

    expect(result).toBeNull();
  });

  it('should convert primaryEmail to lowercase', () => {
    const value = {
      primaryEmail: 'TEST@EXAMPLE.COM',
      additionalEmails: null,
    };

    const result = transformEmailsValue(value);

    expect(result.primaryEmail).toBe('test@example.com');
  });

  it('should return null for primaryEmail when it is empty string', () => {
    const value = {
      primaryEmail: '',
      additionalEmails: null,
    };

    const result = transformEmailsValue(value);

    expect(result.primaryEmail).toBeNull();
  });

  it('should return null for primaryEmail when it is null', () => {
    const value = {
      primaryEmail: null,
      additionalEmails: null,
    };

    const result = transformEmailsValue(value);

    expect(result.primaryEmail).toBeNull();
  });

  it('should return null for primaryEmail when it is undefined', () => {
    const value = {
      additionalEmails: null,
    };

    const result = transformEmailsValue(value);

    expect(result.primaryEmail).toBeNull();
  });

  it('should convert additionalEmails array to lowercase JSON string', () => {
    const value = {
      primaryEmail: 'test@example.com',
      additionalEmails: ['USER1@EXAMPLE.COM', 'USER2@EXAMPLE.COM'],
    };

    const result = transformEmailsValue(value);

    expect(result.additionalEmails).toBe(
      '["user1@example.com","user2@example.com"]',
    );
  });

  it('should parse and convert additionalEmails JSON string to lowercase', () => {
    const value = {
      primaryEmail: 'test@example.com',
      additionalEmails: '["USER1@EXAMPLE.COM","USER2@EXAMPLE.COM"]',
    };

    const result = transformEmailsValue(value);

    expect(result.additionalEmails).toBe(
      '["user1@example.com","user2@example.com"]',
    );
  });

  it('should return null for additionalEmails when it is an empty array', () => {
    const value = {
      primaryEmail: 'test@example.com',
      additionalEmails: [],
    };

    const result = transformEmailsValue(value);

    expect(result.additionalEmails).toBeNull();
  });

  it('should return null for additionalEmails when it is null', () => {
    const value = {
      primaryEmail: 'test@example.com',
      additionalEmails: null,
    };

    const result = transformEmailsValue(value);

    expect(result.additionalEmails).toBeNull();
  });

  it('should handle mixed case emails in additionalEmails array', () => {
    const value = {
      primaryEmail: 'test@example.com',
      additionalEmails: ['Test1@Example.COM', 'TEST2@example.com'],
    };

    const result = transformEmailsValue(value);

    expect(result.additionalEmails).toBe(
      '["test1@example.com","test2@example.com"]',
    );
  });

  it('should transform both primaryEmail and additionalEmails correctly', () => {
    const value = {
      primaryEmail: 'PRIMARY@EXAMPLE.COM',
      additionalEmails: ['ADDITIONAL1@EXAMPLE.COM', 'ADDITIONAL2@EXAMPLE.COM'],
    };

    const result = transformEmailsValue(value);

    expect(result).toEqual({
      primaryEmail: 'primary@example.com',
      additionalEmails: '["additional1@example.com","additional2@example.com"]',
    });
  });

  it('should handle case where primaryEmail is null and additionalEmails exist', () => {
    const value = {
      primaryEmail: null,
      additionalEmails: ['USER@EXAMPLE.COM'],
    };

    const result = transformEmailsValue(value);

    expect(result).toEqual({
      primaryEmail: null,
      additionalEmails: '["user@example.com"]',
    });
  });

  it('should handle case where primaryEmail exists and additionalEmails is null', () => {
    const value = {
      primaryEmail: 'USER@EXAMPLE.COM',
      additionalEmails: null,
    };

    const result = transformEmailsValue(value);

    expect(result).toEqual({
      primaryEmail: 'user@example.com',
      additionalEmails: null,
    });
  });

  it('should handle empty value object', () => {
    const value = {};

    const result = transformEmailsValue(value);

    expect(result).toEqual({
      primaryEmail: null,
      additionalEmails: undefined,
    });
  });
});
