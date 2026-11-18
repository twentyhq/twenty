import { styled } from '@linaria/react';
import { IconDotsVertical } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

const StyledLoadingIconContainer = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  justify-content: center;
  padding-inline: ${themeCssVariables.spacing[1]};
  width: fit-content;
`;

const StyledLoadingIconWrapper = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: flex;
  transform: rotate(90deg);
`;

export const AiChatInitialLoadingIndicator = () => {
  const theme = useTheme();

  return (
    <StyledLoadingIconContainer>
      <StyledLoadingIconWrapper>
        <IconDotsVertical size={theme.icon.size.xl} />
      </StyledLoadingIconWrapper>
    </StyledLoadingIconContainer>
  );
};
