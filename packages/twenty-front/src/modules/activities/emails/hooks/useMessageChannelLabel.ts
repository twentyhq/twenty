import { getMessageChannelLabel } from '@/activities/emails/utils/getMessageChannelLabel';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type TimelineThreadChannel } from '~/generated/graphql';

export const useMessageChannelLabel = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  return {
    getMessageChannelLabel: (
      channel:
        | Pick<TimelineThreadChannel, 'provider' | 'applicationId'>
        | null
        | undefined,
    ) => getMessageChannelLabel({ channel, currentWorkspace }),
  };
};
