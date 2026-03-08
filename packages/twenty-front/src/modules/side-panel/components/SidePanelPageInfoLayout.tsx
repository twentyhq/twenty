import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledPageInfoContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[0.5]};
`;

export const StyledPageInfoIcon = styled.div<{ iconColor?: string }>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${({ iconColor }) => iconColor ?? ''};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

export const StyledPageInfoTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[0.5]};
  min-width: 0;
`;

export const StyledPageInfoTitleContainer = styled.div`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  max-width: 150px;
  min-width: 0;
  padding-inline: ${themeCssVariables.spacing[1]};
`;

export const StyledPageInfoLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  white-space: nowrap;
`;

type SidePanelPageInfoLayoutProps = {
  icon?: ReactNode;
  iconColor?: string;
  title: ReactNode;
  label?: ReactNode;
};

export const SidePanelPageInfoLayout = ({
  icon,
  iconColor,
  title,
  label,
}: SidePanelPageInfoLayoutProps) => {
  return (
    <StyledPageInfoContainer>
      {isDefined(icon) && (
        <StyledPageInfoIcon iconColor={iconColor}>{icon}</StyledPageInfoIcon>
      )}
      <StyledPageInfoTextContainer>
        <StyledPageInfoTitleContainer>{title}</StyledPageInfoTitleContainer>
        {isDefined(label) && <StyledPageInfoLabel>{label}</StyledPageInfoLabel>}
      </StyledPageInfoTextContainer>
    </StyledPageInfoContainer>
  );
};
