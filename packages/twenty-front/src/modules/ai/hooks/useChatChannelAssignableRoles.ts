import { useQuery } from '@apollo/client/react';

import { GetChatChannelAssignableRolesDocument } from '~/generated-metadata/graphql';

export const useChatChannelAssignableRoles = () => {
  const { data, loading } = useQuery(GetChatChannelAssignableRolesDocument);

  return {
    assignableRoles: data?.chatChannelAssignableRoles ?? [],
    loading,
  };
};
