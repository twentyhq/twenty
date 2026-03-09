import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme-constants';

type VisibilityElementState = 'active' | 'inactive';

type SettingsAccountsVisibilityIconProps = {
  className?: string;
  metadata?: VisibilityElementState;
  subject?: VisibilityElementState;
  body?: VisibilityElementState;
};

const StyledCardMedia = styled.div`
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
  <StyledCardMedia className={className}>
    {!!metadata && <StyledMetadataSkeleton isActive={metadata === 'active'} />}
    {!!subject && <StyledSubjectSkeleton isActive={subject === 'active'} />}
    {!!body && <StyledBodySkeleton isActive={body === 'active'} />}
  </StyledCardMedia>
);
