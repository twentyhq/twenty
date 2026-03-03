import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { styled } from '@linaria/react';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledFullScreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${themeCssVariables.background.noisy};
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  z-index: ${RootStackingContextZIndices.RootModal};
`;

const StyledFullScreenHeader = styled(PageHeader)`
  padding-left: ${themeCssVariables.spacing[3]};
`;

const StyledFullScreenContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  flex: 1;
  min-height: 0;
  padding: 0 ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[3]};

  // Make the immediate child a flex column that grows, so nested components
  // with height="100%" (e.g., editors) can size correctly.
  > * {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    row-gap: ${themeCssVariables.spacing[5]};
  }
`;

type UseFullScreenModalProps = {
  links: BreadcrumbProps['links'];
  onClose: () => void;
  hasClosePageButton?: boolean;
};

export const useFullScreenModal = ({
  links,
  onClose,
  hasClosePageButton = true,
}: UseFullScreenModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const renderFullScreenModal = (
    children: React.ReactNode,
    isOpen: boolean,
  ) => {
    if (!isOpen) return null;

    return createPortal(
      <StyledFullScreenOverlay
        ref={overlayRef}
        data-globally-prevent-click-outside="true"
        tabIndex={-1}
      >
        <StyledFullScreenHeader
          title={<Breadcrumb links={links} />}
          hasClosePageButton={hasClosePageButton}
          onClosePage={onClose}
        />
        <StyledFullScreenContent>{children}</StyledFullScreenContent>
      </StyledFullScreenOverlay>,
      document.body,
    );
  };

  return {
    overlayRef,
    renderFullScreenModal,
  };
};
