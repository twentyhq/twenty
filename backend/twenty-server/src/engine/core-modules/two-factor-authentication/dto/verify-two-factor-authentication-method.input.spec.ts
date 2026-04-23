import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { VerifyTwoFactorAuthenticationMethodInput } from './verify-two-factor-authentication-method.input';

describe('VerifyTwoFactorAuthenticationMethodInput', () => {
  it('should pass validation with valid OTP', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: '123456',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation with empty OTP', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: '',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('otp');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with non-string OTP', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: 123456,
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('otp');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation with non-numeric string OTP', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: 'abcdef',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('otp');
    expect(errors[0].constraints).toHaveProperty('isNumberString');
  });

  it('should fail validation with OTP shorter than 6 digits', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: '12345',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('otp');
    expect(errors[0].constraints).toHaveProperty('isLength');
    expect(errors[0].constraints?.isLength).toBe(
      'OTP must be exactly 6 digits',
    );
  });

  it('should fail validation with OTP longer than 6 digits', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: '1234567',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('otp');
    expect(errors[0].constraints).toHaveProperty('isLength');
    expect(errors[0].constraints?.isLength).toBe(
      'OTP must be exactly 6 digits',
    );
  });

  it('should fail validation with null OTP', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: null,
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('otp');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with undefined OTP', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {});

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('otp');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should pass validation with numeric string OTP containing leading zeros', async () => {
    const input = plainToClass(VerifyTwoFactorAuthenticationMethodInput, {
      otp: '012345',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(0);
  });
});
