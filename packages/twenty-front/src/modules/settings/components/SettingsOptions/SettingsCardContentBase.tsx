import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type StyledCardContentProps = {
  disabled?: boolean;
  alignItems?: 'center' | 'flex-start';
  fullHeight?: boolean;
};

export const StyledSettingsCardContent = styled.div<StyledCardContentProps>`
  align-items: ${({ alignItems }) => alignItems ?? 'center'};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  background-color: ${themeCssVariables.background.secondary};
  height: ${({ fullHeight }) => (fullHeight ? '100%' : 'auto')};
  padding: ${themeCssVariables.spacing[4]};
`;
export const StyledSettingsCardIcon = styled.div`
  align-items: center;
  border: 2px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  height: ${themeCssVariables.spacing[7]};
  justify-content: center;
  width: ${themeCssVariables.spacing[7]};
  min-width: ${themeCssVariables.icon.size.md};
`;

export const StyledSettingsCardTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

export const StyledSettingsCardTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StyledSettingsCardDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  line-height: 1.5;

  a {
    position: relative;
    z-index: 1;
    pointer-events: auto;
  }
`;

export const StyledSettingsCardThirdLine = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;
