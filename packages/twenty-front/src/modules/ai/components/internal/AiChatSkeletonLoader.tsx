import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { StyledInboxContentContainer } from '@/ai/components/StyledAiChatContentContainer';
import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

const StyledSkeletonContainer = styled(StyledInboxContentContainer)`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[3]};
`;

export const InboxSkeletonLoader = () => {
  return (
    <StyledSkeletonContainer>
      <SkeletonLine
        height={20}
        borderRadius={themeCssVariables.border.radius.mdRound}
      />
    </StyledSkeletonContainer>
  );
};
