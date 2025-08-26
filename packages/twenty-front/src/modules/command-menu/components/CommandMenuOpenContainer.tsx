import { COMMAND_MENU_ANIMATION_VARIANTS } from '@/command-menu/constants/CommandMenuAnimationVariants';
import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { type CommandMenuAnimationVariant } from '@/command-menu/types/CommandMenuAnimationVariant';
import { RECORD_CHIP_CLICK_OUTSIDE_ID } from '@/object-record/record-table/constants/RecordChipClickOutsideId';
import { SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/SlashMenuDropdownClickOutsideId';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PAGE_HEADER_COMMAND_MENU_BUTTON_CLICK_OUTSIDE_ID } from '@/ui/layout/page-header/constants/PageHeaderCommandMenuButtonClickOutsideId';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { WORKFLOW_DIAGRAM_CREATE_STEP_NODE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramCreateStepNodeClickOutsideId';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { useTheme } from '@emotion/react';

import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useRecoilCallback } from 'recoil';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/components';
import { useIsMobile } from 'twenty-ui/utilities';

const StyledCommandMenu = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  font-family: ${({ theme }) => theme.font.family};
  height: 100%;
  overflow: hidden;
  padding: 0;
  position: fixed;
  right: 0%;
  top: 0%;
  z-index: ${RootStackingContextZIndices.CommandMenu};
  display: flex;
  flex-direction: column;
`;

export const CommandMenuOpenContainer = ({
  children,
}: React.PropsWithChildren) => {
  const isMobile = useIsMobile();

  const targetVariantForAnimation: CommandMenuAnimationVariant = isMobile
    ? 'fullScreen'
    : 'normal';

  const theme = useTheme();

  const { closeCommandMenu } = useCommandMenu();

  const commandMenuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useRecoilCallback(
    ({ snapshot }) =>
      (event: MouseEvent | TouchEvent) => {
        const currentFocusId = snapshot
          .getLoadable(currentFocusIdSelector)
          .getValue();

        if (currentFocusId === SIDE_PANEL_FOCUS_ID) {
          event.stopImmediatePropagation();
          event.preventDefault();
          closeCommandMenu();
        }
      },
    [closeCommandMenu],
  );

  useListenClickOutside({
    refs: [commandMenuRef],
    callback: handleClickOutside,
    listenerId: 'COMMAND_MENU_LISTENER_ID',
    excludedClickOutsideIds: [
      PAGE_HEADER_COMMAND_MENU_BUTTON_CLICK_OUTSIDE_ID,
      LINK_CHIP_CLICK_OUTSIDE_ID,
      RECORD_CHIP_CLICK_OUTSIDE_ID,
      SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
      WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID,
      WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID,
      WORKFLOW_DIAGRAM_CREATE_STEP_NODE_CLICK_OUTSIDE_ID,
    ],
  });

  return (
    <StyledCommandMenu
      data-testid="command-menu"
      data-click-outside-id={COMMAND_MENU_CLICK_OUTSIDE_ID}
      ref={commandMenuRef}
      animate={targetVariantForAnimation}
      initial="closed"
      exit="closed"
      variants={COMMAND_MENU_ANIMATION_VARIANTS}
      transition={{ duration: theme.animation.duration.normal }}
    >
      {children}
    </StyledCommandMenu>
  );
};
