import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

import { DeleteTwoFactorAuthenticationMethodInput } from './delete-two-factor-authentication-method.input';

describe('DeleteTwoFactorAuthenticationMethodInput', () => {
  const validUUID = '550e8400-e29b-41d4-a716-446655440000';

  it('should pass validation with valid UUID', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: validUUID,
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation with empty ID', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: '',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('twoFactorAuthenticationMethodId');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with invalid UUID format', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: 'invalid-uuid',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('twoFactorAuthenticationMethodId');
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });

  it('should fail validation with non-string ID', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: 123456,
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('twoFactorAuthenticationMethodId');
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });

  it('should fail validation with null ID', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: null,
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('twoFactorAuthenticationMethodId');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with undefined ID', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {});

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('twoFactorAuthenticationMethodId');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with UUID v1 format', async () => {
    const uuidv1 = '550e8400-e29b-11d4-a716-446655440000';
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: uuidv1,
    });

    const errors = await validate(input);

    // UUID v1 should still be valid as it's a proper UUID format
    expect(errors).toHaveLength(0);
  });

  it('should fail validation with partial UUID', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: '550e8400-e29b-41d4',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('twoFactorAuthenticationMethodId');
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });

  it('should fail validation with UUID containing invalid characters', async () => {
    const input = plainToClass(DeleteTwoFactorAuthenticationMethodInput, {
      twoFactorAuthenticationMethodId: '550e8400-e29b-41d4-a716-44665544000g',
    });

    const errors = await validate(input);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('twoFactorAuthenticationMethodId');
    expect(errors[0].constraints).toHaveProperty('isUuid');
  });
});
