import { coerceEmailsFieldOrThrow } from 'src/engine/api/common/common-args-handlers/data-arg-handler/coercer-utils/coerce-emails-field-or-throw.util';

describe('coerceEmailsFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = coerceEmailsFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return null when value is an empty object', () => {
      const result = coerceEmailsFieldOrThrow({}, 'testField');

      expect(result).toBeNull();
    });

    it('should return transformed value when value has primaryEmail only', () => {
      const result = coerceEmailsFieldOrThrow(
        { primaryEmail: 'TEST@EXAMPLE.COM' },
        'testField',
      );

      expect(result).toEqual({
        primaryEmail: 'test@example.com',
        additionalEmails: undefined,
      });
    });

    it('should return transformed value when value has primaryEmail and stringified additionalEmails', () => {
      const result = coerceEmailsFieldOrThrow(
        {
          primaryEmail: 'PRIMARY@EXAMPLE.COM',
          additionalEmails: '["SECOND@EXAMPLE.COM", "THIRD@EXAMPLE.COM"]',
        },
        'testField',
      );

      expect(result).toEqual({
        primaryEmail: 'primary@example.com',
        additionalEmails: '["second@example.com","third@example.com"]',
      });
    });

    it('should return transformed value when value has primaryEmail and  additionalEmails', () => {
      const result = coerceEmailsFieldOrThrow(
        {
          primaryEmail: 'PRIMARY@EXAMPLE.COM',
          additionalEmails: ['SECOND@EXAMPLE.COM', 'THIRD@EXAMPLE.COM'],
        },
        'testField',
      );

      expect(result).toEqual({
        primaryEmail: 'primary@example.com',
        additionalEmails: '["second@example.com","third@example.com"]',
      });
    });

    it('should return transformed value when value has additionalEmails only', () => {
      const result = coerceEmailsFieldOrThrow(
        { additionalEmails: '["EMAIL@EXAMPLE.COM"]' },
        'testField',
      );

      expect(result).toEqual({
        primaryEmail: '',
        additionalEmails: '["email@example.com"]',
      });
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is undefined', () => {
      expect(() => coerceEmailsFieldOrThrow(undefined, 'testField')).toThrow(
        'Invalid value undefined for emails field "testField"',
      );
    });

    it('should throw when value is a string', () => {
      expect(() =>
        coerceEmailsFieldOrThrow('test@example.com', 'testField'),
      ).toThrow(
        'Invalid value \'test@example.com\' for emails field "testField"',
      );
    });

    it('should throw when value has invalid subfields', () => {
      expect(() =>
        coerceEmailsFieldOrThrow(
          { primaryEmail: 'test@example.com', invalidField: 'value' },
          'testField',
        ),
      ).toThrow('Invalid value');
    });
  });
});
