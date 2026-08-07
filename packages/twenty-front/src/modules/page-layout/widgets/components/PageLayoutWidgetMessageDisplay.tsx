import { styled } from '@linaria/react';
import { useContext } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledMessageContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: center;
  min-height: calc(${themeCssVariables.spacing[20]} * 2);
  padding: ${themeCssVariables.spacing[8]};
  text-align: center;
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  max-width: calc(${themeCssVariables.spacing[20]} * 4);
`;

type PageLayoutWidgetMessageDisplayProps = {
  Icon: IconComponent;
  message: string;
};

export const PageLayoutWidgetMessageDisplay = ({
  Icon,
  message,
}: PageLayoutWidgetMessageDisplayProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledMessageContainer>
      <Icon size={theme.icon.size.xl} />
      <StyledMessage>{message}</StyledMessage>
    </StyledMessageContainer>
  );
};
