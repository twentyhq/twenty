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

const StyledCardMediaContainer = styled.div`
  > div {
    align-items: stretch;
  }
`;

const StyledSubjectSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.accent.accent4060
      : themeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 3px;
`;

const StyledMetadataSkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.accent.accent4060
      : themeCssVariables.background.quaternary};
  border-radius: 1px;
  height: 3px;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const StyledBodySkeleton = styled.div<{ isActive?: boolean }>`
  background-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.accent.accent4060
      : themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.xs};
  flex: 1 0 auto;
  height: 3px;
`;

export const SettingsAccountsVisibilityIcon = ({
  className,
  metadata,
  subject,
  body,
}: SettingsAccountsVisibilityIconProps) => (
  <StyledCardMediaContainer className={className}>
    <SettingsAccountsCardMedia>
      {!!metadata && (
        <StyledMetadataSkeleton isActive={metadata === 'active'} />
      )}
      {!!subject && <StyledSubjectSkeleton isActive={subject === 'active'} />}
      {!!body && <StyledBodySkeleton isActive={body === 'active'} />}
    </SettingsAccountsCardMedia>
  </StyledCardMediaContainer>
);
