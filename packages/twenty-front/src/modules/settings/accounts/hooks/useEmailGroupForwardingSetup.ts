import { useMutation, useQuery } from '@apollo/client/react';

import { DISMISS_EMAIL_GROUP_CHANNEL_FORWARDING } from '@/settings/accounts/graphql/mutations/dismissEmailGroupChannelForwarding';
import { GET_EMAIL_GROUP_FORWARDING_SETUPS } from '@/settings/accounts/graphql/queries/getEmailGroupForwardingSetups';

type EmailGroupForwardingSetup = {
  messageChannelId: string;
  status: 'DISMISSED' | 'PROVISIONED';
};

export const useEmailGroupForwardingSetup = () => {
  const { data, loading } = useQuery<{
    emailGroupForwardingSetups: EmailGroupForwardingSetup[];
  }>(GET_EMAIL_GROUP_FORWARDING_SETUPS);

  const [dismissMutation, { loading: isSubmitting }] = useMutation<
    { dismissEmailGroupChannelForwarding: boolean },
    { id: string }
  >(DISMISS_EMAIL_GROUP_CHANNEL_FORWARDING, {
    refetchQueries: [{ query: GET_EMAIL_GROUP_FORWARDING_SETUPS }],
  });

  const setups = data?.emailGroupForwardingSetups ?? [];

  const getSetupStatus = (messageChannelId: string) =>
    setups.find((setup) => setup.messageChannelId === messageChannelId)?.status;

  const dismissForwarding = (messageChannelId: string) =>
    dismissMutation({ variables: { id: messageChannelId } });

  return { getSetupStatus, dismissForwarding, loading, isSubmitting };
};
