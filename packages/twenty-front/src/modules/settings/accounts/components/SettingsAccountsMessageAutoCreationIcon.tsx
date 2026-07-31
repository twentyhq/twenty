import { styled } from '@linaria/react';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/icon';

import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

type SettingsAccountsMessageAutoCreationIconProps = {
  className?: string;
  isSentActive?: boolean;
  isReceivedActive?: boolean;
};

const StyledIconContainer = styled.div`
  align-items: stretch;
  border: 2px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  height: 40px;
  justify-content: center;
  padding: ${themeCssVariables.spacing['0.5']};
  width: 32px;
`;

const StyledDirectionSkeleton = styled.div<{ isActive?: boolean }>`
  align-items: center;
  background-color: ${({ isActive }) =>
    isActive
      ? themeCssVariables.accent.accent7
      : themeCssVariables.border.color.medium};
  border-radius: 1px;
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  flex: 1 0 0;
  justify-content: center;
  min-height: 0;
`;

export const SettingsAccountsMessageAutoCreationIcon = ({
  className,
  isSentActive,
  isReceivedActive,
}: SettingsAccountsMessageAutoCreationIconProps) => {
  const theme = useTheme();

  return (
    <StyledIconContainer className={className}>
      <StyledDirectionSkeleton isActive={isSentActive}>
        <IconArrowUp
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.md}
        />
      </StyledDirectionSkeleton>
      <StyledDirectionSkeleton isActive={isReceivedActive}>
        <IconArrowDown
          size={theme.icon.size.sm}
          stroke={theme.icon.stroke.md}
        />
      </StyledDirectionSkeleton>
    </StyledIconContainer>
  );
};
