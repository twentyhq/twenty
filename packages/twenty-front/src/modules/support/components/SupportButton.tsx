import styled from '@emotion/styled';
import { Button, IconHelpCircle, LightIconButton } from 'twenty-ui';

import { SupportButtonSkeletonLoader } from '@/support/components/SupportButtonSkeletonLoader';
import { useSupportChat } from '@/support/hooks/useSupportChat';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useRecoilValue } from 'recoil';

const StyledButtonContainer = styled.div`
  display: flex;
`;

export const SupportButton = () => {
  const { loading, isFrontChatLoaded } = useSupportChat();

  const isNavigationDrawerExpanded = useRecoilValue(
    isNavigationDrawerExpandedState,
  );
  if (loading) {
    return <SupportButtonSkeletonLoader />;
  }

  if (!isFrontChatLoaded) {
    return;
  }

  return isNavigationDrawerExpanded ? (
    <StyledButtonContainer>
      <Button
        variant="tertiary"
        size="small"
        title="Support"
        Icon={IconHelpCircle}
      />
    </StyledButtonContainer>
  ) : (
    <LightIconButton Icon={IconHelpCircle} />
  );
};
