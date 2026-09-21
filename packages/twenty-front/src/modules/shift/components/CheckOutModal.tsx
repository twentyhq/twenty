import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Heading } from 'twenty-ui/primitives/typography';

import { TextArea } from '@/ui/input/components/TextArea';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['4']};
`;

const StyledSubtitle = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: 0;
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
  justify-content: flex-end;
`;

type CheckOutModalProps = {
  modalInstanceId: string;
  shiftName: string;
  onConfirm: (handoverNote: string | null) => Promise<void>;
};

export const CheckOutModal = ({
  modalInstanceId,
  shiftName,
  onConfirm,
}: CheckOutModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const [handoverNote, setHandoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetAndClose = () => {
    setHandoverNote('');
    closeModal(modalInstanceId);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(handoverNote.trim() === '' ? null : handoverNote.trim());
      resetAndClose();
    } catch {
      // The page handler already surfaced the error snackbar; keep the modal
      // open with the typed handover note intact so the member can retry.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      isClosable
      onClose={resetAndClose}
      renderInDocumentBody
    >
      <StyledContent>
        <Heading level={1} size="lg">{t`Check out`}</Heading>
        <StyledSubtitle>{shiftName}</StyledSubtitle>
        <TextArea
          textAreaId={`${modalInstanceId}-handover-note`}
          label={t`Handover note — pending conversations`}
          placeholder={t`Anything the next shift should pick up? (optional)`}
          value={handoverNote}
          onChange={setHandoverNote}
          minRows={3}
          maxRows={8}
        />
        <StyledFooter>
          <Button
            title={t`Cancel`}
            variant="secondary"
            onClick={resetAndClose}
            disabled={isSubmitting}
          />
          <Button
            title={t`Confirm check out`}
            variant="primary"
            accent="blue"
            onClick={handleConfirm}
            disabled={isSubmitting}
          />
        </StyledFooter>
      </StyledContent>
    </ModalStatefulWrapper>
  );
};
