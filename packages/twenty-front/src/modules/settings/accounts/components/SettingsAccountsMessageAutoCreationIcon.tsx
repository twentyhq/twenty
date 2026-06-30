import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsMessageAutoCreationIconProps = {
  className?: string;
  isSentActive?: boolean;
  isReceivedActive?: boolean;
};

const StyledIconContainer = styled.div`
  align-items: stretch;
  border: 2px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  padding: ${themeCssVariables.spacing['0.5']};
  width: ${themeCssVariables.spacing[6]};
`;

const StyledDirectionSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.accent.accent4060
      : themeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 24px;
`;

export const SettingsAccountsMessageAutoCreationIcon = ({
  className,
  isSentActive,
  isReceivedActive,
}: SettingsAccountsMessageAutoCreationIconProps) => (
  <StyledIconContainer className={className}>
    <StyledDirectionSkeleton isActive={isSentActive} />
    <StyledDirectionSkeleton isActive={isReceivedActive} />
  </StyledIconContainer>
);
