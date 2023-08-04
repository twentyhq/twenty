import { AnimatePresence, LayoutGroup } from 'framer-motion';

import { ButtonVariant } from '@/ui/button/components/Button';
import { Modal } from '@/ui/modal/components/Modal';
import { Section, SectionAlignment } from '@/ui/section/components/Section';
import { H1Title, H1TitleFontColor } from '@/ui/typography/components/H1Title';

import {
  DeleteModalProps,
  StyledCenteredButton,
  StyledDeleteButton,
} from './DeleteModal';

export function ConfirmationModal({
  isOpen = false,
  title,
  subtitle,
  setIsOpen,
  handleConfirmDelete,
  deleteButtonText = 'Delete',
}: DeleteModalProps) {
  return (
    <AnimatePresence mode="wait">
      <LayoutGroup>
        <Modal
          isOpen={isOpen}
          onOutsideClick={() => {
            if (isOpen) {
              setIsOpen(false);
            }
          }}
        >
          <H1Title title={title} fontColor={H1TitleFontColor.Primary} />
          <Section alignment={SectionAlignment.Center}>{subtitle}</Section>
          <StyledDeleteButton
            onClick={handleConfirmDelete}
            variant={ButtonVariant.Secondary}
            title={deleteButtonText}
            fullWidth
          />
          <StyledCenteredButton
            onClick={() => setIsOpen(false)}
            variant={ButtonVariant.Secondary}
            title="Cancel"
            fullWidth
            style={{
              marginTop: 10,
            }}
          />
        </Modal>
      </LayoutGroup>
    </AnimatePresence>
  );
}
