import { useExpandedAnimation } from '@/settings/hooks/useExpandedAnimation';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { IconPoint, MAIN_COLORS } from 'twenty-ui';

const StyledAdvancedWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledIconContainer = styled.div`
  display: flex;
  height: 100%;
  left: ${({ theme }) => theme.spacing(-4)};
  position: absolute;
  top: 0;
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
};

export const AdvancedSettingsWrapper = ({
  children,
  dimension = 'height',
  hideIcon = false,
}: AdvancedSettingsWrapperProps) => {
  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);
  const { contentRef, motionAnimationVariants } = useExpandedAnimation(
    isAdvancedModeEnabled,
    dimension,
  );

  return (
    <AnimatePresence>
      {isAdvancedModeEnabled && (
        <motion.div
          ref={contentRef}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={motionAnimationVariants}
        >
          <StyledAdvancedWrapper>
            {!hideIcon && (
              <StyledIconContainer>
                <StyledIconPoint
                  size={12}
                  color={MAIN_COLORS.yellow}
                  fill={MAIN_COLORS.yellow}
                />
              </StyledIconContainer>
            )}
            <StyledContent>{children}</StyledContent>
          </StyledAdvancedWrapper>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
