import { FullScreenModal } from '@/ui/layout/fullscreen/components/FullScreenModal';
import { type BreadcrumbProps } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useRef } from 'react';
import { createPortal } from 'react-dom';

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
      <FullScreenModal
        ref={overlayRef}
        links={links}
        onClose={onClose}
        hasClosePageButton={hasClosePageButton}
      >
        {children}
      </FullScreenModal>,
      document.body,
    );
  };

  return {
    overlayRef,
    renderFullScreenModal,
  };
};
