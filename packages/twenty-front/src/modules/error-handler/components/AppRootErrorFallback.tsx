import { type AppErrorDisplayProps } from '@/error-handler/types/AppErrorDisplayProps';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { IconReload } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type AppRootErrorFallbackProps = AppErrorDisplayProps;

const StyledContainer = styled.div`
  background: ${themeCssVariables.background.noisy};
  box-sizing: border-box;
  display: flex;
  height: 100vh;
  padding: 12px;
  width: 100vw;
`;

const StyledPanel = styled.div`
  background: ${themeCssVariables.grayScale.gray1};
  border: 1px solid ${themeCssVariables.grayScale.gray5};
  border-radius: 8px;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
`;

const StyledEmptyContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const StyledImageContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  position: relative;
`;

const StyledBackgroundImage = styled.img`
  max-height: 160px;
  max-width: 160px;
`;

const StyledInnerImage = styled.img`
  max-height: 130px;
  max-width: 130px;
  position: absolute;
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
  color: ${themeCssVariables.grayScale.gray12};
  font-size: 1.23rem;
  font-weight: 600;
`;

const StyledEmptySubTitle = styled.div`
  color: ${themeCssVariables.grayScale.gray11};
  font-size: 0.92rem;
  font-weight: 400;
  line-height: 1.5;
  max-height: 2.8em;
  overflow: hidden;
  width: 50%;
`;

const StyledButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.grayScale.gray1};
  border: 1px solid ${themeCssVariables.grayScale.gray5};
  border-radius: 8px;
  color: ${themeCssVariables.grayScale.gray12};
  cursor: pointer;
  display: flex;
  padding: 8px;
  padding: 8px 16px;
`;

const StyledIconContainer = styled.span`
  color: ${themeCssVariables.grayScale.gray12};
  display: inline-flex;
  margin-right: 8px;
`;

export const AppRootErrorFallback = ({
  resetErrorBoundary,
  title = t`Sorry, something went wrong`,
}: AppRootErrorFallbackProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledContainer>
      <StyledPanel>
        <StyledEmptyContainer>
          <StyledImageContainer>
            <StyledBackgroundImage
              src="/images/placeholders/background/error_index_bg.png"
              alt={t`Background`}
            />
            <StyledInnerImage
              src="/images/placeholders/moving-image/error_index.png"
              alt={t`Error illustration`}
            />
          </StyledImageContainer>
          <StyledEmptyTextContainer>
            <StyledEmptyTitle>{title}</StyledEmptyTitle>
            <StyledEmptySubTitle>
              {t`Please refresh the page.`}
            </StyledEmptySubTitle>
          </StyledEmptyTextContainer>
          <StyledButton onClick={resetErrorBoundary}>
            <StyledIconContainer>
              <IconReload size={theme.icon.size.md} />
            </StyledIconContainer>
            {t`Reload`}
          </StyledButton>
        </StyledEmptyContainer>
      </StyledPanel>
    </StyledContainer>
  );
};
