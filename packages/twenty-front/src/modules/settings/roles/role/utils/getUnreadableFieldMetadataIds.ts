import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

export const getUnreadableFieldMetadataIds = ({
  fieldPermissions,
}: Pick<RoleWithPartialMembers, 'fieldPermissions'>) =>
  (fieldPermissions ?? [])
    .filter(({ canReadFieldValue }) => canReadFieldValue === false)
    .map(({ fieldMetadataId }) => fieldMetadataId)
    .sort();
