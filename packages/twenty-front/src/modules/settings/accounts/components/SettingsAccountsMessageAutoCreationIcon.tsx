import styled from '@emotion/styled';

import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';

type SettingsAccountsMessageAutoCreationIconProps = {
  className?: string;
  isSentActive?: boolean;
  isReceivedActive?: boolean;
};

const StyledIconContainer = styled(SettingsAccountsCardMedia)`
  align-items: stretch;
`;

const StyledDirectionSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.accent.accent4060 : theme.background.quaternary};
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
