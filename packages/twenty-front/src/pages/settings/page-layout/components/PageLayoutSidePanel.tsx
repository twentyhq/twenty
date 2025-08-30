import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useIsMobile } from 'twenty-ui/utilities';
import { type GraphSubType } from '../mocks/mockWidgets';
import {
  selectedWidgetTypeState,
  SidePanelStep,
  sidePanelStepState,
} from '../states/pageLayoutSidePanelState';
import { PageLayoutSelectGraphType } from './PageLayoutSelectGraphType';
import { PageLayoutSelectWidgetType } from './PageLayoutSelectWidgetType';
import { PageLayoutSidePanelHeader } from './PageLayoutSidePanelHeader';

const StyledSidePanelContainer = styled(motion.div)<{ $isMobile: boolean }>`
  background: ${({ theme }) => theme.background.primary};
  border-left: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 1000;
  width: ${({ $isMobile }) => ($isMobile ? '100%' : '480px')};
`;

const StyledContent = styled.div`
  background: ${({ theme }) => theme.background.primary};
  flex: 1;
  overflow-y: auto;
`;

const StyledBackdrop = styled(motion.div)`
  background: ${({ theme }) => theme.background.overlayPrimary};
  height: 100%;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 999;
`;

type PageLayoutSidePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateWidget?: (widgetType: 'GRAPH', graphType: GraphSubType) => void;
};

export const PageLayoutSidePanel = ({
  isOpen,
  onClose,
  onCreateWidget,
}: PageLayoutSidePanelProps) => {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const [sidePanelStep, setSidePanelStep] = useRecoilState(sidePanelStepState);
  const selectedWidgetType = useRecoilValue(selectedWidgetTypeState);
  const setSelectedWidgetType = useSetRecoilState(selectedWidgetTypeState);

  useListenClickOutside({
    refs: [panelRef],
    callback: onClose,
    listenerId: 'PAGE_LAYOUT_SIDE_PANEL_LISTENER_ID',
  });

  const handleBack = () => {
    if (sidePanelStep === SidePanelStep.SELECT_GRAPH_TYPE) {
      setSidePanelStep(SidePanelStep.SELECT_WIDGET_TYPE);
      setSelectedWidgetType(null);
    } else if (sidePanelStep === SidePanelStep.SELECT_WIDGET_TYPE) {
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setSidePanelStep(SidePanelStep.SELECT_WIDGET_TYPE);
    setSelectedWidgetType(null);
    onClose();
  };

  const handleSelectGraphType = (graphType: GraphSubType) => {
    if (onCreateWidget !== undefined && selectedWidgetType === 'GRAPH') {
      onCreateWidget('GRAPH', graphType);
    }

    // Reset and close
    setSidePanelStep(SidePanelStep.SELECT_WIDGET_TYPE);
    setSelectedWidgetType(null);
    onClose();
  };

  const renderStepContent = () => {
    switch (sidePanelStep) {
      case SidePanelStep.SELECT_WIDGET_TYPE:
        return <PageLayoutSelectWidgetType />;
      case SidePanelStep.SELECT_GRAPH_TYPE:
        return (
          <PageLayoutSelectGraphType
            onSelectGraphType={handleSelectGraphType}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {isMobile && (
            <StyledBackdrop
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
            />
          )}
          <StyledSidePanelContainer
            ref={panelRef}
            $isMobile={isMobile}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
          >
            <PageLayoutSidePanelHeader
              onClose={handleClose}
              onBack={handleBack}
            />
            <StyledContent>{renderStepContent()}</StyledContent>
          </StyledSidePanelContainer>
        </>
      )}
    </AnimatePresence>
  );
};
