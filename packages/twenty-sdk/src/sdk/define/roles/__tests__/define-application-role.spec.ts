import { defineApplicationRole } from '@/sdk/define';

describe('defineApplicationRole', () => {
  const validConfig = {
    universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    label: 'Default function role',
    description: 'Default role for function Twenty client',
  };

  it('should return successful validation result when valid', () => {
    const result = defineApplicationRole(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should pass through all optional fields', () => {
    const config = {
      ...validConfig,
      icon: 'IconShield',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    };

    const result = defineApplicationRole(config);

    expect(result.success).toBe(true);
    expect(result.config?.icon).toBe('IconShield');
    expect(result.config?.canReadAllObjectRecords).toBe(true);
  });

  it('should accept permissionFlags', () => {
    const config = {
      ...validConfig,
      permissionFlags: ['UPLOAD_FILE'],
    };

    const result = defineApplicationRole(config as any);

    expect(result.success).toBe(true);
    expect(result.config?.permissionFlags).toHaveLength(1);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      label: 'Default function role',
    };

    const result = defineApplicationRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Role must have a universalIdentifier');
  });

  it('should return error when label is missing', () => {
    const config = {
      universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    };

    const result = defineApplicationRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Role must have a label');
  });

  it('should return error when objectPermission has no objectUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      objectPermissions: [
        {
          canReadObjectRecords: true,
        },
      ],
    };

    const result = defineApplicationRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Object permission must have an objectUniversalIdentifier',
    );
  });
});
