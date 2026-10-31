import { isDefined } from 'twenty-shared/utils';

import { type Role } from '~/generated-metadata/graphql';

// A grant is not editable through the role APIs, but admins edit it from the app's Access tab
export const isRolePermissionsEditable = (
  role: Pick<Role, 'isEditable' | 'grantedToApplicationId'>,
) => role.isEditable || isDefined(role.grantedToApplicationId);
