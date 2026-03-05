import { COMMAND_MENU_CLICK_OUTSIDE_ID } from '@/command-menu/constants/CommandMenuClickOutsideId';
import { RECORD_CHIP_CLICK_OUTSIDE_ID } from '@/object-record/record-table/constants/RecordChipClickOutsideId';
import { SIDE_PANEL_ANIMATION_VARIANTS } from '@/side-panel/constants/SidePanelAnimationVariants';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelAnimatingState } from '@/side-panel/states/isSidePanelAnimatingState';
import { type SidePanelAnimationVariant } from '@/side-panel/types/SidePanelAnimationVariant';
import { MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/MentionMenuDropdownClickOutsideId';
import { SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/ui/input/constants/SlashMenuDropdownClickOutsideId';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID } from '@/ui/layout/page-header/constants/PageHeaderSidePanelButtonClickOutsideId';
import { NAVIGATION_DRAWER_CLICK_OUTSIDE_ID } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerClickOutsideId';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { WORKFLOW_DIAGRAM_CREATE_STEP_NODE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramCreateStepNodeClickOutsideId';
import { WORKFLOW_DIAGRAM_STEP_NODE_BASE_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/constants/WorkflowDiagramStepNodeClickOutsideId';
import { WORKFLOW_DIAGRAM_EDGE_OPTIONS_CLICK_OUTSIDE_ID } from '@/workflow/workflow-diagram/workflow-edges/constants/WorkflowDiagramEdgeOptionsClickOutsideId';
import { useStore } from 'jotai';

import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { useCallback, useContext, useRef } from 'react';
import { LINK_CHIP_CLICK_OUTSIDE_ID } from 'twenty-ui/components';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useIsMobile } from 'twenty-ui/utilities';
const StyledCommandMenuBase = styled.div`
  background: ${themeCssVariables.background.primary};
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  font-family: ${themeCssVariables.font.family};
  height: 100%;
  overflow: hidden;
  padding: 0;
  position: fixed;
  right: 0%;
  top: 0%;
  z-index: ${RootStackingContextZIndices.SidePanel};
  display: flex;
  flex-direction: column;
`;
const StyledCommandMenu = motion.create(StyledCommandMenuBase);

export const CommandMenuOpenContainer = ({
  children,
}: React.PropsWithChildren) => {
  const { theme } = useContext(ThemeContext);
  const isMobile = useIsMobile();

  const targetVariantForAnimation: SidePanelAnimationVariant = isMobile
    ? 'fullScreen'
    : 'normal';
  const { closeSidePanelMenu } = useSidePanelMenu();

  const commandMenuRef = useRef<HTMLDivElement>(null);
  const setIsSidePanelAnimating = useSetAtomState(isSidePanelAnimatingState);

  const store = useStore();

  const handleClickOutside = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const currentFocusId = store.get(currentFocusIdSelector.atom);

      if (currentFocusId === SIDE_PANEL_FOCUS_ID) {
        event.stopImmediatePropagation();
        event.preventDefault();
        closeSidePanelMenu();
      }
    },
    [closeSidePanelMenu, store],
  );

  useListenClickOutside({
    refs: [commandMenuRef],
    callback: handleClickOutside,
    listenerId: 'COMMAND_MENU_LISTENER_ID',
    excludedClickOutsideIds: [
      NAVIGATION_DRAWER_CLICK_OUTSIDE_ID,
      PAGE_HEADER_SIDE_PANEL_BUTTON_CLICK_OUTSIDE_ID,
      LINK_CHIP_CLICK_OUTSIDE_ID,
      RECORD_CHIP_CLICK_OUTSIDE_ID,
      SLASH_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
      MENTION_MENU_DROPDOWN_CLICK_OUTSIDE_ID,
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
      variants={SIDE_PANEL_ANIMATION_VARIANTS}
      transition={{
        duration: theme.animation.duration.normal,
      }}
      onAnimationStart={() => setIsSidePanelAnimating(true)}
      onAnimationComplete={() => setIsSidePanelAnimating(false)}
    >
      {children}
    </StyledCommandMenu>
  );
};
