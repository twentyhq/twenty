import { type ObjectPermissions } from 'twenty-shared/types';
import { checkFieldPermissions } from '@/page-layout/utils/checkFieldPermissions';

describe('checkFieldPermissions', () => {
  const mockObjectPermissions: ObjectPermissions = {
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
  };

  it('should return true when no fields are restricted', () => {
    const fieldIds = ['field-1', 'field-2', 'field-3'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {},
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should return true when field is not in restrictedFields map', () => {
    const fieldIds = ['field-1', 'field-2'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-3': { canRead: false },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should return false when any field has canRead set to false', () => {
    const fieldIds = ['field-1', 'field-2', 'field-3'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-2': { canRead: false },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(false);
  });

  it('should return false when multiple fields are restricted', () => {
    const fieldIds = ['field-1', 'field-2', 'field-3'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: false },
        'field-2': { canRead: false },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(false);
  });

  it('should return true when field has canRead set to true', () => {
    const fieldIds = ['field-1', 'field-2'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: true },
        'field-2': { canRead: true },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should return true when field has canRead set to null', () => {
    const fieldIds = ['field-1'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: null },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should return true when field has canRead set to undefined', () => {
    const fieldIds = ['field-1'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: undefined },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should return true for empty field list', () => {
    const fieldIds: string[] = [];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: false },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should handle mixed permissions correctly', () => {
    const fieldIds = ['field-1', 'field-2', 'field-3', 'field-4'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: true },
        'field-2': { canRead: null },
        'field-3': { canRead: undefined },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should fail fast and return false on first restricted field', () => {
    const fieldIds = ['field-1', 'field-2', 'field-3'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: false },
        'field-2': { canRead: false },
        'field-3': { canRead: false },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(false);
  });

  it('should only check canRead, not canUpdate', () => {
    const fieldIds = ['field-1'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canRead: true, canUpdate: false },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });

  it('should handle field with only canUpdate restriction', () => {
    const fieldIds = ['field-1'];
    const permissions = {
      ...mockObjectPermissions,
      restrictedFields: {
        'field-1': { canUpdate: false },
      },
    };

    expect(checkFieldPermissions(fieldIds, permissions)).toBe(true);
  });
});
