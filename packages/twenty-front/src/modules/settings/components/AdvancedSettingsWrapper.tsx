import { AdvancedSettingsContentWrapperWithDot } from '@/settings/components/AdvancedSettingsContentWrapperWithDot';
import { ADVANCED_SETTINGS_ANIMATION_DURATION } from '@/settings/constants/AdvancedSettingsAnimationDurations';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import styled from '@emotion/styled';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

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
  const isAdvancedModeEnabled = useAtomValue(isAdvancedModeEnabledState);

  return (
    <AnimatedExpandableContainer
      isExpanded={isAdvancedModeEnabled}
      dimension={animationDimension}
      animationDurations={ADVANCED_SETTINGS_ANIMATION_DURATION}
      mode="scroll-height"
      containAnimation={false}
    >
      <AdvancedSettingsContentWrapperWithDot
        hideDot={hideDot}
        dotPosition={dotPosition}
      >
        <StyledContent>{children}</StyledContent>
      </AdvancedSettingsContentWrapperWithDot>
    </AnimatedExpandableContainer>
  );
};
