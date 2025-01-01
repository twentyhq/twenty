import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { EmailThreadMembersChip } from '@/activities/emails/components/EmailThreadMembersChip';
import { messageThreadState } from '@/ui/layout/right-drawer/states/messageThreadState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const MessageThreadSubscribersTopBar = () => {
  const isMessageThreadSubscriberEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsMessageThreadSubscriberEnabled,
  );

  const messageThread = useRecoilValue(messageThreadState);

  const numberOfSubscribers = messageThread?.subscribers?.length ?? 0;

  const shouldShowMembersChip = numberOfSubscribers > 0;

  if (
    !isMessageThreadSubscriberEnabled ||
    !isDefined(messageThread) ||
    !shouldShowMembersChip
  ) {
    return null;
  }

  return (
    <StyledButtonContainer>
      <EmailThreadMembersChip messageThread={messageThread} />
    </StyledButtonContainer>
  );
};
