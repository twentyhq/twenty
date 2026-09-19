import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { agentChatCurrentUserRoleIdsState } from '@/ai/states/agentChatCurrentUserRoleIdsState';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { GetChatChannelsDocument } from '~/generated-metadata/graphql';

export const useRefreshAgentChatChannels = () => {
  const client = useApolloClient();
  const { replaceDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const setAgentChatCurrentUserRoleIds = useSetAtomState(
    agentChatCurrentUserRoleIdsState,
  );

  const refreshAgentChatChannels = useCallback(async () => {
    const result = await client
      .query({ query: GetChatChannelsDocument, fetchPolicy: 'network-only' })
      .catch(() => undefined);

    const channels = result?.data?.chatChannels;
    const members = result?.data?.chatChannelMembers;
    const roles = result?.data?.chatChannelRoles;
    const currentUserRoleIds = result?.data?.chatCurrentUserRoleIds;

    if (
      !isDefined(channels) ||
      !isDefined(members) ||
      !isDefined(roles) ||
      !isDefined(currentUserRoleIds)
    ) {
      return undefined;
    }

    setAgentChatCurrentUserRoleIds(currentUserRoleIds);
    replaceDraft('agentChatChannels', channels);
    replaceDraft('agentChatChannelMembers', members);
    replaceDraft('agentChatChannelRoles', roles);
    applyChanges();

    return { channels, members, roles };
  }, [client, replaceDraft, applyChanges, setAgentChatCurrentUserRoleIds]);

  return { refreshAgentChatChannels };
};
