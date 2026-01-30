import { defineRole } from '@/sdk';

describe('defineRole', () => {
  const validConfig = {
    universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    label: 'App User',
    description: 'Standard user role',
  };

  it('should return successful validation result when valid', () => {
    const result = defineRole(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should pass through all optional fields', () => {
    const config = {
      ...validConfig,
      icon: 'IconUser',
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    };

    const result = defineRole(config);

    expect(result.success).toBe(true);
    expect(result.config?.icon).toBe('IconUser');
    expect(result.config?.canReadAllObjectRecords).toBe(true);
  });

  it('should accept permissionFlags', () => {
    const config = {
      ...validConfig,
      permissionFlags: ['UPLOAD_FILE', 'DOWNLOAD_FILE'],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(true);
    expect(result.config?.permissionFlags).toHaveLength(2);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      label: 'App User',
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Role must have a universalIdentifier');
  });

  it('should return error when label is missing', () => {
    const config = {
      universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    };

    const result = defineRole(config as any);

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

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Object permission must have an objectUniversalIdentifier',
    );
  });

  it('should return error when fieldPermission has no objectUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      fieldPermissions: [
        {
          fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
          canReadFieldValue: true,
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Field permission must have an objectUniversalIdentifier',
    );
  });

  it('should return error when fieldPermission has no fieldUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      fieldPermissions: [
        {
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          canReadFieldValue: true,
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Field permission must have a fieldUniversalIdentifier',
    );
  });
});
