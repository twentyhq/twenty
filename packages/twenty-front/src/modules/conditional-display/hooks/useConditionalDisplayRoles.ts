import { useQuery } from '@apollo/client/react';
import { GetRolesDocument } from '~/generated-metadata/graphql';

export const useConditionalDisplayRoles = () => {
  const { data } = useQuery(GetRolesDocument);

  const roles = (data?.getRoles ?? []).filter(
    (role) => role.canBeAssignedToUsers,
  );

  return { roles };
};
