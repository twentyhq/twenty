import { useMutation } from '@apollo/client/react';

import { UPDATE_EMAIL_GROUP_CHANNEL } from '@/settings/accounts/graphql/mutations/updateEmailGroupChannel';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';

type UpdateEmailGroupChannelResult = {
  updateEmailGroupChannel: {
    id: string;
    displayName: string | null;
    defaultInboxQueueId: string | null;
  };
};

// An omitted field leaves the channel's current value untouched, so a caller
// changing one setting cannot blank out the other.
type UpdateEmailGroupChannelUpdates = {
  displayName?: string | null;
  defaultInboxQueueId?: string | null;
};

type UpdateEmailGroupChannelVariables = {
  input: { id: string } & UpdateEmailGroupChannelUpdates;
};

export const useUpdateEmailGroupChannel = () => {
  const [mutate, { loading, error }] = useMutation<
    UpdateEmailGroupChannelResult,
    UpdateEmailGroupChannelVariables
  >(UPDATE_EMAIL_GROUP_CHANNEL, {
    refetchQueries: [{ query: GET_MY_MESSAGE_CHANNELS }],
  });

  const updateEmailGroupChannel = (
    id: string,
    updates: UpdateEmailGroupChannelUpdates,
  ) => mutate({ variables: { input: { id, ...updates } } });

  return { updateEmailGroupChannel, loading, error };
};
