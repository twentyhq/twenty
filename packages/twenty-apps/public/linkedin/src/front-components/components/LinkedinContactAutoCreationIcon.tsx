import styled from '@emotion/styled';
import { IconArrowDown, IconArrowUp } from 'twenty-ui/icon';
import { THEME_COMMON, themeCssVariables } from 'twenty-ui/theme';

// Mirrors twenty-front's SettingsAccountsMessageAutoCreationIcon, which a front component cannot import.
const StyledIconContainer = styled.div`
  align-items: stretch;
  border: 2px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 2px;
  height: 40px;
  justify-content: center;
  padding: 2px;
  width: 32px;
`;

const StyledDirectionSkeleton = styled.div<{ $isActive: boolean }>`
  align-items: center;
  background-color: ${({ $isActive }) =>
    $isActive
      ? themeCssVariables.accent.accent7
      : themeCssVariables.border.color.medium};
  border-radius: 1px;
  color: ${() => themeCssVariables.font.color.inverted};
  display: flex;
  flex: 1 0 0;
  justify-content: center;
  min-height: 0;
`;

type LinkedinContactAutoCreationIconProps = {
  isSentActive: boolean;
  isReceivedActive: boolean;
};

export const LinkedinContactAutoCreationIcon = ({
  isSentActive,
  isReceivedActive,
}: LinkedinContactAutoCreationIconProps) => (
  <StyledIconContainer>
    <StyledDirectionSkeleton $isActive={isSentActive}>
      <IconArrowUp
        size={THEME_COMMON.icon.size.sm}
        stroke={THEME_COMMON.icon.stroke.md}
      />
    </StyledDirectionSkeleton>
    <StyledDirectionSkeleton $isActive={isReceivedActive}>
      <IconArrowDown
        size={THEME_COMMON.icon.size.sm}
        stroke={THEME_COMMON.icon.stroke.md}
      />
    </StyledDirectionSkeleton>
  </StyledIconContainer>
);
