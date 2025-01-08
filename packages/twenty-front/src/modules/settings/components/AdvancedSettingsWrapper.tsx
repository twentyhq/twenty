import { ADVANCED_SETTINGS_ANIMATION_DURATION } from '@/settings/constants/AdvancedSettingsAnimationDurations';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { AnimatedExpandableContainer, IconPoint, MAIN_COLORS } from 'twenty-ui';

const StyledAdvancedWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledIconContainer = styled.div<{ navigationDrawerItem: boolean }>`
  display: flex;
  position: absolute;

  ${({ navigationDrawerItem, theme }) => {
    if (navigationDrawerItem) {
      return `
        height: 100%;
        left: ${theme.spacing(-5)};
        align-items: center;
      `;
    }
    return `
      left: ${theme.spacing(-4)};
      top: ${theme.spacing(1)};
    `;
  }}
`;

const StyledContent = styled.div`
  width: 100%;
`;

const StyledIconPoint = styled(IconPoint)`
  margin-right: 0;
`;

type AdvancedSettingsWrapperProps = {
  children: React.ReactNode;
  dimension?: 'width' | 'height';
  hideIcon?: boolean;
  navigationDrawerItem?: boolean;
};

export const AdvancedSettingsWrapper = ({
  children,
  dimension = 'height',
  hideIcon = false,
  navigationDrawerItem = false,
}: AdvancedSettingsWrapperProps) => {
  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  return (
    <AnimatedExpandableContainer
      isExpanded={isAdvancedModeEnabled}
      dimension={dimension}
      animationDurations={ADVANCED_SETTINGS_ANIMATION_DURATION}
      mode="scroll-height"
      containAnimation={false}
    >
      <StyledAdvancedWrapper>
        {!hideIcon && (
          <StyledIconContainer navigationDrawerItem={navigationDrawerItem}>
            <StyledIconPoint
              size={12}
              color={MAIN_COLORS.yellow}
              fill={MAIN_COLORS.yellow}
            />
          </StyledIconContainer>
        )}
        <StyledContent>{children}</StyledContent>
      </StyledAdvancedWrapper>
    </AnimatedExpandableContainer>
  );
};
