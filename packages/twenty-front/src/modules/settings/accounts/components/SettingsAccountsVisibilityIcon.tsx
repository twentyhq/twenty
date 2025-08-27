import styled from '@emotion/styled';

import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';

type VisibilityElementState = 'active' | 'inactive';

type SettingsAccountsVisibilityIconProps = {
  className?: string;
  metadata?: VisibilityElementState;
  subject?: VisibilityElementState;
  body?: VisibilityElementState;
};

const StyledCardMedia = styled(SettingsAccountsCardMedia)`
  align-items: stretch;
`;

const StyledSubjectSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive, theme }) =>
    isActive ? theme.accent.accent4060 : theme.background.quaternary};
  border-radius: 1px;
  height: 3px;
`;

const StyledMetadataSkeleton = styled(StyledSubjectSkeleton)`
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledBodySkeleton = styled(StyledSubjectSkeleton)`
  border-radius: ${({ theme }) => theme.border.radius.xs};
  flex: 1 0 auto;
`;

export const SettingsAccountsVisibilityIcon = ({
  className,
  metadata,
  subject,
  body,
}: SettingsAccountsVisibilityIconProps) => (
  <StyledCardMedia className={className}>
    {!!metadata && <StyledMetadataSkeleton isActive={metadata === 'active'} />}
    {!!subject && <StyledSubjectSkeleton isActive={subject === 'active'} />}
    {!!body && <StyledBodySkeleton isActive={body === 'active'} />}
  </StyledCardMedia>
);
