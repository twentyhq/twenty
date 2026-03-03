import { styled } from '@linaria/react';

import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsAccountsMessageAutoCreationIconProps = {
  className?: string;
  isSentActive?: boolean;
  isReceivedActive?: boolean;
};

const StyledIconContainer = styled(SettingsAccountsCardMedia)`
  align-items: stretch;
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
