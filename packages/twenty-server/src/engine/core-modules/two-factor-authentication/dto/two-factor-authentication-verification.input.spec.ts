import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { TwoFactorAuthenticationVerificationInput } from './two-factor-authentication-verification.input';

describe('TwoFactorAuthenticationVerificationInput', () => {
  const validData = {
    otp: '123456',
    loginToken: 'valid-login-token',
    captchaToken: 'optional-captcha-token',
  };

  it('should pass validation with all valid fields', async () => {
    const input = plainToClass(
      TwoFactorAuthenticationVerificationInput,
      validData,
    );

    const errors = await validate(input);

    expect(errors).toHaveLength(0);
  });

  it('should pass validation without optional captchaToken', async () => {
    const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
      otp: '123456',
      loginToken: 'valid-login-token',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(0);
  });

  describe('otp field validation', () => {
    it('should fail validation with empty OTP', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        otp: '',
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('otp');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string OTP', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        otp: 123456,
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('otp');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with null OTP', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        otp: null,
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('otp');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with undefined OTP', async () => {
      const { otp: _otp, ...dataWithoutOtp } = validData;
      const input = plainToClass(
        TwoFactorAuthenticationVerificationInput,
        dataWithoutOtp,
      );

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('otp');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('loginToken field validation', () => {
    it('should fail validation with empty loginToken', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        loginToken: '',
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('loginToken');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string loginToken', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        loginToken: 123456,
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('loginToken');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with null loginToken', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        loginToken: null,
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('loginToken');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with undefined loginToken', async () => {
      const { loginToken: _loginToken, ...dataWithoutLoginToken } = validData;
      const input = plainToClass(
        TwoFactorAuthenticationVerificationInput,
        dataWithoutLoginToken,
      );

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('loginToken');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('captchaToken field validation', () => {
    it('should pass validation with valid captchaToken', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        captchaToken: 'valid-captcha-token',
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with null captchaToken', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        captchaToken: null,
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with undefined captchaToken', async () => {
      const { captchaToken: _captchaToken, ...dataWithoutCaptcha } = validData;
      const input = plainToClass(
        TwoFactorAuthenticationVerificationInput,
        dataWithoutCaptcha,
      );

      const errors = await validate(input);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with non-string captchaToken', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        captchaToken: 123456,
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('captchaToken');
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should pass validation with empty string captchaToken (since it is optional)', async () => {
      const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
        ...validData,
        captchaToken: '',
      });

      const errors = await validate(input);

      expect(errors).toHaveLength(0);
    });
  });

  it('should fail validation with multiple invalid fields', async () => {
    const input = plainToClass(TwoFactorAuthenticationVerificationInput, {
      otp: '',
      loginToken: null,
      captchaToken: 123456,
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(3);

    const errorProperties = errors.map((error) => error.property);

    expect(errorProperties).toContain('otp');
    expect(errorProperties).toContain('loginToken');
    expect(errorProperties).toContain('captchaToken');
  });
});
