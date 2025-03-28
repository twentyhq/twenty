import { ADVANCED_SETTINGS_ANIMATION_DURATION } from '@/settings/constants/AdvancedSettingsAnimationDurations';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { AnimatedExpandableContainer, MAIN_COLORS } from 'twenty-ui';
import { AdvancedWrapper as StyledAdvancedWrapper } from './StyledAdvancedWrapper';
import { DotContainer as StyledDotContainer } from './StyledDotContainer';
import { IconPoint as StyledIconPoint } from './StyledIconPoint';
const StyledContent = styled.div`
  width: 100%;
`;

type DotPosition = 'top' | 'centered';

type AdvancedSettingsWrapperProps = {
  children: React.ReactNode;
  animationDimension?: 'width' | 'height';
  hideDot?: boolean;
  dotPosition?: DotPosition;
};

export const AdvancedSettingsWrapper = ({
  children,
  hideDot = false,
  dotPosition = 'centered',
  animationDimension = 'height',
}: AdvancedSettingsWrapperProps) => {
  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  return (
    <AnimatedExpandableContainer
      isExpanded={isAdvancedModeEnabled}
      dimension={animationDimension}
      animationDurations={ADVANCED_SETTINGS_ANIMATION_DURATION}
      mode="scroll-height"
      containAnimation={false}
    >
      <StyledAdvancedWrapper>
        {!hideDot && (
          <StyledDotContainer dotPosition={dotPosition}>
            <StyledIconPoint
              size={12}
              color={MAIN_COLORS.yellow}
              fill={MAIN_COLORS.yellow}
            />
          </StyledDotContainer>
        )}
        <StyledContent>{children}</StyledContent>
      </StyledAdvancedWrapper>
    </AnimatedExpandableContainer>
  );
};
