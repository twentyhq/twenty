import { useMutation } from '@apollo/client/react';

import {
  type MessageChannelContactAutoCreationPolicy,
  type MessageChannelType,
  type MessageChannelVisibility,
} from 'twenty-shared/types';

import { CREATE_EMAIL_GROUP_CHANNEL } from '@/settings/accounts/graphql/mutations/createEmailGroupChannel';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';

type CreateEmailGroupChannelResult = {
  createEmailGroupChannel: {
    messageChannel: {
      id: string;
      handle: string;
      visibility: MessageChannelVisibility;
      type: MessageChannelType;
      isSyncEnabled: boolean;
      excludeGroupEmails: boolean;
      contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;
    };
    forwardingAddress: string;
  };
};

type CreateEmailGroupChannelVariables = {
  input: {
    handle: string;
  };
};

export const useCreateEmailGroupChannel = () => {
  const [mutate, { loading, error }] = useMutation<
    CreateEmailGroupChannelResult,
    CreateEmailGroupChannelVariables
  >(CREATE_EMAIL_GROUP_CHANNEL, {
    refetchQueries: [
      { query: GET_MY_CONNECTED_ACCOUNTS },
      { query: GET_MY_MESSAGE_CHANNELS },
    ],
  });

  const createEmailGroupChannel = (handle: string) =>
    mutate({ variables: { input: { handle } } });

  return { createEmailGroupChannel, loading, error };
};
