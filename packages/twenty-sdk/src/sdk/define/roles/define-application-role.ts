import { type DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { defineRole } from '@/sdk/define/roles/define-role';
import { type RoleConfig } from '@/sdk/define/roles/role-config';

export const defineApplicationRole: DefineEntity<RoleConfig> = (config) =>
  defineRole(config);
