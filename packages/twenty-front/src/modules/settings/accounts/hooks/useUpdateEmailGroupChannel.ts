import { useMutation } from '@apollo/client/react';

import { UPDATE_EMAIL_GROUP_CHANNEL } from '@/settings/accounts/graphql/mutations/updateEmailGroupChannel';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';

type UpdateEmailGroupChannelResult = {
  updateEmailGroupChannel: {
    id: string;
    displayName: string | null;
  };
};

type UpdateEmailGroupChannelVariables = {
  input: {
    id: string;
    displayName?: string | null;
  };
};

export const useUpdateEmailGroupChannel = () => {
  const [mutate, { loading, error }] = useMutation<
    UpdateEmailGroupChannelResult,
    UpdateEmailGroupChannelVariables
  >(UPDATE_EMAIL_GROUP_CHANNEL, {
    refetchQueries: [{ query: GET_MY_MESSAGE_CHANNELS }],
  });

  const updateEmailGroupChannel = (id: string, displayName: string | null) =>
    mutate({ variables: { input: { id, displayName } } });

  return { updateEmailGroupChannel, loading, error };
};
