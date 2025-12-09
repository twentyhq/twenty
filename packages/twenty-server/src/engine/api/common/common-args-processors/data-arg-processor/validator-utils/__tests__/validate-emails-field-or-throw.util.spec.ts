import { validateEmailsFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-emails-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateEmailsFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateEmailsFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the emails object when all fields are valid', () => {
      const emailsValue = {
        primaryEmail: 'primary@example.com',
        additionalEmails: ['secondary1@example.com', 'secondary2@example.com'],
      };
      const result = validateEmailsFieldOrThrow(emailsValue, 'testField');

      expect(result).toEqual(emailsValue);
    });

    it('should return the emails object when only primaryEmail is provided', () => {
      const emailsValue = {
        primaryEmail: 'primary@example.com',
      };
      const result = validateEmailsFieldOrThrow(emailsValue, 'testField');

      expect(result).toEqual(emailsValue);
    });

    it('should accept empty additionalEmails array', () => {
      const emailsValue = {
        primaryEmail: 'primary@example.com',
        additionalEmails: [],
      };
      const result = validateEmailsFieldOrThrow(emailsValue, 'testField');

      expect(result).toEqual(emailsValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is not an object', () => {
      expect(() =>
        validateEmailsFieldOrThrow('not an object', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is undefined', () => {
      expect(() => validateEmailsFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when primaryEmail is not a string', () => {
      const emailsValue = {
        primaryEmail: 12345,
      };

      expect(() =>
        validateEmailsFieldOrThrow(emailsValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when additionalEmails is not an array', () => {
      const emailsValue = {
        additionalEmails: { key: 'not an array' },
      };

      expect(() =>
        validateEmailsFieldOrThrow(emailsValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when invalid subfields are present', () => {
      const emailsValue = {
        primaryEmail: 'primary@example.com',
        invalidField1: 'invalid',
        invalidField2: 'invalid',
      };

      expect(() =>
        validateEmailsFieldOrThrow(emailsValue, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
