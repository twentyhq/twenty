import styled from '@emotion/styled';
import { AIChatTab } from '@/ai/components/AIChatTab';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledContainer = styled.div<{ isMobile: boolean }>`
  height: ${({ theme, isMobile }) => {
    const mobileOffset = isMobile ? theme.spacing(13) : '0px';

    return `calc(100% - ${mobileOffset})`;
  }};
  width: 100%;
`;

export const CommandMenuAskAIPage = () => {
  const isMobile = useIsMobile();

  return (
    <StyledContainer isMobile={isMobile}>
      <AIChatTab />
    </StyledContainer>
  );
};
