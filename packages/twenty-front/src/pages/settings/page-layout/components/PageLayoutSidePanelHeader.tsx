import { CommandMenuContextChip } from '@/command-menu/components/CommandMenuContextChip';
import { CommandMenuContextChipGroups } from '@/command-menu/components/CommandMenuContextChipGroups';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useRecoilValue } from 'recoil';
import { IconChevronLeft, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  SidePanelStep,
  sidePanelStepState,
} from '../states/pageLayoutSidePanelState';

const HEADER_HEIGHT = 60;

const StyledHeader = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.font.size.lg};
  height: ${HEADER_HEIGHT}px;
  margin: 0;
  outline: none;
  position: relative;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  gap: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 0;
`;

const StyledContentContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCloseButtonWrapper = styled.div<{ isVisible?: boolean }>`
  visibility: ${({ isVisible = true }) => (isVisible ? 'visible' : 'hidden')};
`;

type PageLayoutSidePanelHeaderProps = {
  onClose: () => void;
  onBack?: () => void;
};

export const PageLayoutSidePanelHeader = ({
  onClose,
  onBack,
}: PageLayoutSidePanelHeaderProps) => {
  const theme = useTheme();
  const sidePanelStep = useRecoilValue(sidePanelStepState);

  const contextChips = [];

  if (sidePanelStep === SidePanelStep.SELECT_WIDGET_TYPE) {
    contextChips.push({
      Icons: [],
      text: 'New Widget',
      onClick: undefined,
    });
  } else if (sidePanelStep === SidePanelStep.SELECT_GRAPH_TYPE) {
    contextChips.push({
      Icons: [],
      text: 'New Widget',
      onClick: () => onBack?.(),
    });
    contextChips.push({
      Icons: [],
      text: 'Graph',
      onClick: undefined,
    });
  }

  const backButtonAnimationDuration =
    contextChips.length > 0 ? theme.animation.duration.instant : 0;

  return (
    <StyledHeader>
      <StyledContentContainer>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{
              duration: backButtonAnimationDuration,
            }}
          >
            <CommandMenuContextChip
              Icons={[<IconChevronLeft size={theme.icon.size.sm} />]}
              onClick={onBack}
              testId="page-layout-go-back-button"
              forceEmptyText={true}
            />
          </motion.div>
        </AnimatePresence>
        <CommandMenuContextChipGroups contextChips={contextChips} />
      </StyledContentContainer>

      <StyledCloseButtonWrapper isVisible={true}>
        <Button
          Icon={IconX}
          dataTestId="page-layout-close-side-panel-button"
          size={'small'}
          variant="secondary"
          accent="default"
          ariaLabel="Close side panel"
          onClick={onClose}
        />
      </StyledCloseButtonWrapper>
    </StyledHeader>
  );
};
