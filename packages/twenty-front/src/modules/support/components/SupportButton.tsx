import styled from '@emotion/styled';
import { IconHelpCircle } from 'twenty-ui';

import { SupportButtonSkeletonLoader } from '@/support/components/SupportButtonSkeletonLoader';
import { useSupportChat } from '@/support/hooks/useSupportChat';
import { Button } from '@/ui/input/button/components/Button';

const StyledButtonContainer = styled.div`
  display: flex;
`;

export const SupportButton = () => {
  const { loading, isFrontChatLoaded } = useSupportChat();

  if (loading) {
    return <SupportButtonSkeletonLoader />;
  }

  return isFrontChatLoaded ? (
    <StyledButtonContainer>
      <Button
        variant="tertiary"
        size="small"
        title="Support"
        Icon={IconHelpCircle}
      />
    </StyledButtonContainer>
  ) : null;
};
