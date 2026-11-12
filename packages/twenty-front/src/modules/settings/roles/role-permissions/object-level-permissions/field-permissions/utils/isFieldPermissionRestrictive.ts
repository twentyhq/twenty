import { type FieldPermission } from '~/generated-metadata/graphql';

export const isFieldPermissionRestrictive = ({
  canReadFieldValue,
  canUpdateFieldValue,
}: Pick<FieldPermission, 'canReadFieldValue' | 'canUpdateFieldValue'>) =>
  canReadFieldValue === false || canUpdateFieldValue === false;
