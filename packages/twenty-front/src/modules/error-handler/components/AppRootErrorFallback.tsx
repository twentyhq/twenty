import { AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { IconReload } from 'twenty-ui/display';
import { GRAY_SCALE, THEME_DARK } from 'twenty-ui/theme';

type AppRootErrorFallbackProps = AppErrorDisplayProps;

const StyledContainer = styled.div`
  background: ${THEME_DARK.background.noisy};
  box-sizing: border-box;
  display: flex;
  height: 100vh;
  width: 100vw;
  padding: 12px;
`;

const StyledPanel = styled.div`
  background: ${GRAY_SCALE.gray0};
  border: 1px solid ${GRAY_SCALE.gray20};
  border-radius: 8px;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
`;

const StyledEmptyContainer = styled(motion.div)`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
  text-align: center;
`;

const StyledImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const StyledBackgroundImage = styled.img`
  max-height: 160px;
  max-width: 160px;
`;

const StyledInnerImage = styled.img`
  max-height: 130px;
  position: absolute;
  max-width: 130px;
`;

const StyledEmptyTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const StyledEmptyTitle = styled.div`
  color: ${GRAY_SCALE.gray60};
  font-size: 1.23rem;
  font-weight: 600;
`;

const StyledEmptySubTitle = styled.div`
  color: ${GRAY_SCALE.gray50};
  font-size: 0.92rem;
  font-weight: 400;
  line-height: 1.5;
  max-height: 2.8em;
  overflow: hidden;
  width: 50%;
`;

const StyledButton = styled.button`
  align-items: center;
  background: ${GRAY_SCALE.gray0};
  border: 1px solid ${GRAY_SCALE.gray20};
  color: ${GRAY_SCALE.gray60};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  padding: 8px 16px;
  padding: 8px;
`;

const StyledIcon = styled(IconReload)`
  color: ${GRAY_SCALE.gray60};
  margin-right: 8px;
`;

export const AppRootErrorFallback = ({
  error,
  resetErrorBoundary,
  title = 'Sorry, something went wrong',
}: AppRootErrorFallbackProps) => {
  return (
    <StyledContainer>
      <StyledPanel>
        <StyledEmptyContainer>
          <StyledImageContainer>
            <StyledBackgroundImage
              src="/images/placeholders/background/error_index_bg.png"
              alt="Background"
            />
            <StyledInnerImage
              src="/images/placeholders/moving-image/error_index.png"
              alt="Inner"
            />
          </StyledImageContainer>
          <StyledEmptyTextContainer>
            <StyledEmptyTitle>{title}</StyledEmptyTitle>
            <StyledEmptySubTitle>{error.message}</StyledEmptySubTitle>
          </StyledEmptyTextContainer>
          <StyledButton onClick={resetErrorBoundary}>
            <StyledIcon size={16} />
            Reload
          </StyledButton>
        </StyledEmptyContainer>
      </StyledPanel>
    </StyledContainer>
  );
};
