import { createState } from 'twenty-ui';

import { Role } from '~/generated/graphql';

export type CurrentRole = Role

export const currentRoleState = createState<Role | null>({
  key: 'currentRoleState',
  defaultValue: null,
});

export const isReadyPermissionValidation = createState<boolean>({
  key: 'isReadyPermissionValidation',
  defaultValue: false
})
