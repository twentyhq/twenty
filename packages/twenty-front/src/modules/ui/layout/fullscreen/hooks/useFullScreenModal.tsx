import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import {
  Breadcrumb,
  type BreadcrumbProps,
} from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import styled from '@emotion/styled';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

const StyledFullScreenOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.background.noisy};
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  z-index: ${RootStackingContextZIndices.RootModal};
`;

const StyledFullScreenHeader = styled(PageHeader)`
  padding-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledFullScreenContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  flex: 1;
  min-height: 0;
  padding: ${({ theme }) =>
    `0 ${theme.spacing(3)} ${theme.spacing(3)} ${theme.spacing(3)}`};

  // Make the immediate child a flex column that grows, so nested components
  // with height="100%" (e.g., editors) can size correctly.
  > * {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    row-gap: ${({ theme }) => theme.spacing(5)};
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
