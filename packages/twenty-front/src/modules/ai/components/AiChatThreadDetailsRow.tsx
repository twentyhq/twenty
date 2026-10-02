import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[6]};
  width: 96px;
`;

const StyledLabelText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledValue = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-height: ${themeCssVariables.spacing[6]};
  min-width: 0;
`;

type AiChatThreadDetailsRowProps = {
  Icon: IconComponent;
  label: string;
  action?: ReactNode;
  children: ReactNode;
};

export const AiChatThreadDetailsRow = ({
  Icon,
  label,
  action,
  children,
}: AiChatThreadDetailsRowProps) => {
  const theme = useTheme();

  return (
    <StyledRow>
      <StyledLabel>
        <Icon size={theme.icon.size.sm} />
        <StyledLabelText>{label}</StyledLabelText>
      </StyledLabel>
      <StyledValue>{children}</StyledValue>
      {action}
    </StyledRow>
  );
};
