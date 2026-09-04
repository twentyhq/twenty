import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledSettingsCardContent = styled.div<{ $isDimmed?: boolean }>`
  align-items: center;
  background-color: ${() => themeCssVariables.background.secondary};
  display: flex;
  gap: ${() => themeCssVariables.spacing[3]};
  opacity: ${({ $isDimmed }) => ($isDimmed ? 0.72 : 1)};
  padding: ${() => themeCssVariables.spacing[4]};
`;

export const StyledSettingsCardIcon = styled.div`
  align-items: center;
  background-color: ${() => themeCssVariables.background.primary};
  border: 2px solid ${() => themeCssVariables.border.color.light};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  height: ${() => themeCssVariables.spacing[8]};
  justify-content: center;
  min-width: ${() => themeCssVariables.spacing[8]};
  width: ${() => themeCssVariables.spacing[8]};
`;

export const StyledSettingsCardTitle = styled.div`
  color: ${() => themeCssVariables.font.color.primary};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-bottom: ${() => themeCssVariables.spacing[1]};
`;

export const StyledSettingsCardTextContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

export const StyledSettingsCardDescription = styled.div`
  color: ${() => themeCssVariables.font.color.secondary};
  font-size: ${() => themeCssVariables.font.size.sm};
  line-height: ${() => themeCssVariables.text.lineHeight.lg};
  overflow: hidden;
`;
