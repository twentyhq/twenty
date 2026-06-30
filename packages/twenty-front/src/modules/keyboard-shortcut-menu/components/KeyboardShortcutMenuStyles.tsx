import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

export const StyledDialog = styled.div<{ isMobile: boolean }>`
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  font-family: ${themeCssVariables.font.family};
  left: 50%;
  max-width: 400px;
  overflow: hidden;
  padding: 0;
  padding: ${themeCssVariables.spacing[1]};
  position: fixed;
  top: 30%;
  transform: ${({ isMobile }) =>
    isMobile ? 'translateX(-49.5%)' : 'translateX(-50%)'};
  width: ${({ isMobile }) => (isMobile ? 'calc(100% - 40px)' : '100%')};
  z-index: 1000;
`;

export const StyledHeading = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
`;

export const StyledContainer = styled.div`
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[4]};
  padding-left: ${themeCssVariables.spacing[4]};
  padding-right: ${themeCssVariables.spacing[4]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

export const StyledGroupHeading = styled.label`
  color: ${themeCssVariables.color.gray10};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[4]};
`;

export const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const StyledItem = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${themeCssVariables.font.weight.regular};
  height: 24px;
  justify-content: space-between;
`;

export const StyledShortcutKey = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow: ${themeCssVariables.boxShadow.underline};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  height: 20px;
  justify-content: center;
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};
  text-align: center;
`;

export const StyledShortcutKeyContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
`;
