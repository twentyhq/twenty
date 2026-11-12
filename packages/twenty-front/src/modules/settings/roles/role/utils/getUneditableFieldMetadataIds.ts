import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getUneditableFieldMetadataIds = ({
  fieldPermissions,
}: Pick<RoleWithPartialMembers, 'fieldPermissions'>) =>
  (fieldPermissions ?? [])
    .filter(({ canUpdateFieldValue }) => canUpdateFieldValue === false)
    .map(({ fieldMetadataId }) => fieldMetadataId)
    .sort();
