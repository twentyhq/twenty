import { Injectable } from '@nestjs/common';

export interface FieldPermissionInput {
  roleId: string;
  objectName: string;
  fieldName: string;
  canRead: boolean | null;
  canUpdate: boolean | null;
}

interface FieldAccessEvaluationRequest {
  roleIds: string[];
  objectName: string;
  fieldName: string;
  action: 'read' | 'update';
  permissions: FieldPermissionInput[];
}

@Injectable()
export class FieldRbacService {
  evaluateFieldAccess(request: FieldAccessEvaluationRequest) {
    const relevantPermissions = request.permissions.filter(
      (permission) =>
        request.roleIds.includes(permission.roleId) &&
        permission.objectName === request.objectName &&
        permission.fieldName === request.fieldName,
    );

    if (relevantPermissions.length === 0) {
      return {
        allowed: false,
        reason: 'no-explicit-permission',
        appliedPermissions: [],
      };
    }

    const deniedByRole = relevantPermissions.filter((permission) =>
      request.action === 'read'
        ? permission.canRead === false
        : permission.canUpdate === false,
    );

    if (deniedByRole.length > 0) {
      return {
        allowed: false,
        reason: 'explicit-deny',
        appliedPermissions: deniedByRole,
      };
    }

    const allowedByRole = relevantPermissions.filter((permission) =>
      request.action === 'read'
        ? permission.canRead === true
        : permission.canUpdate === true,
    );

    return {
      allowed: allowedByRole.length > 0,
      reason: allowedByRole.length > 0 ? 'explicit-allow' : 'no-allow-match',
      appliedPermissions: allowedByRole,
    };
  }
}
