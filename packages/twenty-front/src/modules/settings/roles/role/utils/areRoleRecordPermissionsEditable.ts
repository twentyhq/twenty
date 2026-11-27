import { STANDARD_ROLE } from 'twenty-shared/constants';

import { type Role } from '~/generated-metadata/graphql';

export const areRoleRecordPermissionsEditable = (
  role: Pick<Role, 'isEditable' | 'universalIdentifier'>,
): boolean =>
  role.isEditable ||
  role.universalIdentifier === STANDARD_ROLE.admin.universalIdentifier;
