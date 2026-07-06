import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconDotsVertical } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLoadingIconContainer = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  padding-inline: ${themeCssVariables.spacing[1]};
`;

const StyledLoadingIconWrapper = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: flex;
  transform: rotate(90deg);
`;

export const AiChatInitialLoadingIndicator = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledLoadingIconContainer>
      <StyledLoadingIconWrapper>
        <IconDotsVertical size={theme.icon.size.xl} />
      </StyledLoadingIconWrapper>
    </StyledLoadingIconContainer>
  );
};
