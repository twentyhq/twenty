import { useMutation } from '@apollo/client/react';

import { DELETE_EMAIL_GROUP_CHANNEL } from '@/settings/accounts/graphql/mutations/deleteEmailGroupChannel';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';

type DeleteEmailGroupChannelResult = {
  deleteEmailGroupChannel: {
    id: string;
  };
};

type DeleteEmailGroupChannelVariables = {
  id: string;
};

export const useDeleteEmailGroupChannel = () => {
  const [mutate, { loading, error }] = useMutation<
    DeleteEmailGroupChannelResult,
    DeleteEmailGroupChannelVariables
  >(DELETE_EMAIL_GROUP_CHANNEL, {
    refetchQueries: [
      { query: GET_MY_CONNECTED_ACCOUNTS },
      { query: GET_MY_MESSAGE_CHANNELS },
    ],
  });

  const deleteEmailGroupChannel = (id: string) => mutate({ variables: { id } });

  return { deleteEmailGroupChannel, loading, error };
};
