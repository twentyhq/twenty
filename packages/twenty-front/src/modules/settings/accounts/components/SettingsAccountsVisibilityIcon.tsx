import { styled } from '@linaria/react';

import { SettingsAccountsCardMedia } from '@/settings/accounts/components/SettingsAccountsCardMedia';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  background-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.accent.accent4060
      : themeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 3px;
`;

const StyledMetadataSkeleton = styled(StyledSubjectSkeleton)`
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledBodySkeleton = styled(StyledSubjectSkeleton)`
  border-radius: ${themeCssVariables.border.radius.xs};
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
