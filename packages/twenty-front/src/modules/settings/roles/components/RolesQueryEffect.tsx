import { usePopulateRoles } from '@/settings/roles/hooks/usePopulateRoles';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useGetRolesQuery } from '~/generated/graphql';

export const RolesQueryEffect = () => {
  const { data, loading } = useGetRolesQuery({
    fetchPolicy: 'network-only',
  });

  const { populateRoles } = usePopulateRoles();

  useEffect(() => {
    if (!loading) {
      const roles = data?.getRoles;
      if (!isDefined(roles)) {
        return;
      }

      populateRoles(roles);
    }
  }, [data, loading, populateRoles]);

  return null;
};
