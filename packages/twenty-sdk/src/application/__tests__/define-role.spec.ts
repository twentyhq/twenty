import { defineRole } from '@/application';

describe('defineRole', () => {
  const validConfig = {
    universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    label: 'App User',
    description: 'Standard user role',
  };

  it('should return the config when valid', () => {
    const result = defineRole(validConfig);

    expect(result).toEqual(validConfig);
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

    expect(result.icon).toBe('IconUser');
    expect(result.canReadAllObjectRecords).toBe(true);
  });

  it('should accept objectPermissions with objectNameSingular', () => {
    const config = {
      ...validConfig,
      objectPermissions: [
        {
          objectNameSingular: 'postCard',
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
      ],
    };

    const result = defineRole(config);

    expect(result.objectPermissions).toHaveLength(1);
    expect(result.objectPermissions![0].objectNameSingular).toBe('postCard');
  });

  it('should accept objectPermissions with objectUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      objectPermissions: [
        {
          objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
          canReadObjectRecords: true,
        },
      ],
    };

    const result = defineRole(config);

    expect(result.objectPermissions![0].objectUniversalIdentifier).toBe(
      '54b589ca-eeed-4950-a176-358418b85c05',
    );
  });

  it('should accept fieldPermissions with fieldName', () => {
    const config = {
      ...validConfig,
      fieldPermissions: [
        {
          objectNameSingular: 'postCard',
          fieldName: 'content',
          canReadFieldValue: true,
          canUpdateFieldValue: false,
        },
      ],
    };

    const result = defineRole(config);

    expect(result.fieldPermissions).toHaveLength(1);
    expect(result.fieldPermissions![0].fieldName).toBe('content');
  });

  it('should accept fieldPermissions with fieldUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      fieldPermissions: [
        {
          objectNameSingular: 'postCard',
          fieldUniversalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          canReadFieldValue: true,
        },
      ],
    };

    const result = defineRole(config);

    expect(result.fieldPermissions![0].fieldUniversalIdentifier).toBe(
      '58a0a314-d7ea-4865-9850-7fb84e72f30b',
    );
  });

  it('should accept permissionFlags', () => {
    const config = {
      ...validConfig,
      permissionFlags: ['UPLOAD_FILE', 'DOWNLOAD_FILE'],
    };

    const result = defineRole(config as any);

    expect(result.permissionFlags).toHaveLength(2);
  });

  it('should throw error when universalIdentifier is missing', () => {
    const config = {
      label: 'App User',
    };

    expect(() => defineRole(config as any)).toThrow(
      'Role must have a universalIdentifier',
    );
  });

  it('should throw error when label is missing', () => {
    const config = {
      universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    };

    expect(() => defineRole(config as any)).toThrow('Role must have a label');
  });

  it('should throw error when objectPermission has neither objectNameSingular nor objectUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      objectPermissions: [
        {
          canReadObjectRecords: true,
        },
      ],
    };

    expect(() => defineRole(config as any)).toThrow(
      'Object permission must have either objectNameSingular or objectUniversalIdentifier',
    );
  });

  it('should throw error when fieldPermission has neither objectNameSingular nor objectUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      fieldPermissions: [
        {
          fieldName: 'content',
          canReadFieldValue: true,
        },
      ],
    };

    expect(() => defineRole(config as any)).toThrow(
      'Field permission must have either objectNameSingular or objectUniversalIdentifier',
    );
  });

  it('should throw error when fieldPermission has neither fieldName nor fieldUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      fieldPermissions: [
        {
          objectNameSingular: 'postCard',
          canReadFieldValue: true,
        },
      ],
    };

    expect(() => defineRole(config as any)).toThrow(
      'Field permission must have either fieldName or fieldUniversalIdentifier',
    );
  });
});
