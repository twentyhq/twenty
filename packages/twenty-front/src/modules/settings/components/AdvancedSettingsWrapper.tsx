import { ADVANCED_SETTINGS_ANIMATION_DURATION } from '@/settings/constants/AdvancedSettingsAnimationDurations';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { AnimatedExpandableContainer, IconPoint, MAIN_COLORS } from 'twenty-ui';

type DotPosition = 'top' | 'centered';

const StyledAdvancedWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledDotContainer = styled.div<{ dotPosition: DotPosition }>`
  display: flex;
  position: absolute;
  height: 100%;
  left: ${({ theme }) => theme.spacing(-5)};

  ${({ dotPosition }) => {
    if (dotPosition === 'top') {
      return `
        top: 0;
      `;
    }
    return `
      align-items: center;
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
