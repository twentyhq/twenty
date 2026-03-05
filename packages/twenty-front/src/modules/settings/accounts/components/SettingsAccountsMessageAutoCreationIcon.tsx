import { styled } from '@linaria/react';

import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsMessageAutoCreationIconProps = {
  className?: string;
  isSentActive?: boolean;
  isReceivedActive?: boolean;
};

const StyledIconContainerWrapper = styled.div`
  > div {
    align-items: stretch;
  }
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
  <StyledIconContainerWrapper className={className}>
    <SettingsAccountsCardMedia>
      <StyledDirectionSkeleton isActive={isSentActive} />
      <StyledDirectionSkeleton isActive={isReceivedActive} />
    </SettingsAccountsCardMedia>
  </StyledIconContainerWrapper>
);
