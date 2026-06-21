import { SystemPermissionFlag, defineRole } from '@/sdk/define';

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

  it('should accept permissionFlagUniversalIdentifiers', () => {
    const config = {
      ...validConfig,
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.UPLOAD_FILE,
        SystemPermissionFlag.DOWNLOAD_FILE,
      ],
    };

    const result = defineRole(config);

    expect(result.success).toBe(true);
    expect(result.config?.permissionFlagUniversalIdentifiers).toHaveLength(2);
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

  it('should accept row level permission predicates', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
          operand: 'IS',
          workspaceMemberFieldUniversalIdentifier:
            'b1c2d3e4-0829-4475-a794-d0d4959161e6',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return error when predicate has no objectUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicates: [
        {
          fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
          operand: 'IS',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Row level permission predicate must have an objectUniversalIdentifier',
    );
  });

  it('should return error when predicate has no fieldUniversalIdentifier', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          operand: 'IS',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Row level permission predicate must have a fieldUniversalIdentifier',
    );
  });

  it('should return error when predicate has no operand', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Row level permission predicate must have an operand',
    );
  });

  it('should return error when predicate references an unknown predicate group', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
          operand: 'IS',
          predicateGroupUniversalIdentifier:
            '00000000-0000-4000-8000-000000000000',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Row level permission predicate references unknown predicate group "00000000-0000-4000-8000-000000000000"',
    );
  });

  it('should accept a predicate referencing a declared predicate group', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: '11111111-0000-4000-8000-000000000000',
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          logicalOperator: 'OR',
        },
      ],
      rowLevelPermissionPredicates: [
        {
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          fieldUniversalIdentifier: 'dd14cab4-0829-4475-a794-d0d4959161e6',
          operand: 'IS',
          predicateGroupUniversalIdentifier:
            '11111111-0000-4000-8000-000000000000',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return error when predicate group has no logicalOperator', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: '11111111-0000-4000-8000-000000000000',
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Row level permission predicate group must have a logicalOperator',
    );
  });

  it('should return error when two predicate groups share a universalIdentifier', () => {
    const config = {
      ...validConfig,
      rowLevelPermissionPredicateGroups: [
        {
          universalIdentifier: '11111111-0000-4000-8000-000000000000',
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          logicalOperator: 'AND',
        },
        {
          universalIdentifier: '11111111-0000-4000-8000-000000000000',
          objectUniversalIdentifier: '38339ab2-f00b-416c-8ee0-806b48caca18',
          logicalOperator: 'OR',
        },
      ],
    };

    const result = defineRole(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Duplicate row level permission predicate group universalIdentifier "11111111-0000-4000-8000-000000000000"',
    );
  });
});
