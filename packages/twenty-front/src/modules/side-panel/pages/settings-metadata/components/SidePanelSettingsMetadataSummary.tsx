import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledIdentity = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledApiName = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type SidePanelSettingsMetadataSummaryProps = {
  Icon: IconComponent;
  label: string;
  apiName: string;
  description?: string | null;
  children?: ReactNode;
};

export const SidePanelSettingsMetadataSummary = ({
  Icon,
  label,
  apiName,
  description,
  children,
}: SidePanelSettingsMetadataSummaryProps) => {
  const theme = useTheme();

  return (
    <StyledContainer>
      <StyledIdentity>
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <StyledLabel>{label}</StyledLabel>
      </StyledIdentity>
      <StyledApiName>{apiName}</StyledApiName>
      {isNonEmptyString(description) && (
        <StyledDescription>{description}</StyledDescription>
      )}
      {children}
    </StyledContainer>
  );
};
