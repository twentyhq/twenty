import { getCompanyDomainName } from '@/object-metadata/utils/getCompanyDomainName';
import { RecordChip } from '@/object-record/components/RecordChip';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useEffect } from 'react';

type CompanyDuplicateWarningModalProps = {
  duplicates: ObjectRecord[];
  errorMessage?: string;
  isOpen: boolean;
  onCancel: () => void;
  onContinueAnyway: () => void;
  onRetry: () => void;
};

const COMPANY_DUPLICATE_WARNING_MODAL_ID = 'company-duplicate-warning-modal';

export const CompanyDuplicateWarningModal = ({
  duplicates,
  errorMessage,
  isOpen,
  onCancel,
  onContinueAnyway,
  onRetry,
}: CompanyDuplicateWarningModalProps) => {
  const { closeModal, openModal } = useModal();

  useEffect(() => {
    if (isOpen) {
      openModal(COMPANY_DUPLICATE_WARNING_MODAL_ID);

      return;
    }

    closeModal(COMPANY_DUPLICATE_WARNING_MODAL_ID);
  }, [closeModal, isOpen, openModal]);

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      modalId={COMPANY_DUPLICATE_WARNING_MODAL_ID}
      isClosable={true}
      onClose={onCancel}
      padding="large"
      ignoreContainer
      dataGloballyPreventClickOutside
    >
      <Modal.Content>
        <h2>Potential duplicate companies</h2>
        <p>
          {errorMessage ??
            'Review similar companies before saving this record.'}
        </p>
        {errorMessage ? null : (
          <div>
            {duplicates.map((duplicate) => (
              <div key={duplicate.id}>
                <RecordChip
                  forceDisableClick
                  objectNameSingular="company"
                  record={duplicate}
                />
                <div>{getCompanyDomainName(duplicate as any) ?? ''}</div>
              </div>
            ))}
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        <button onClick={onCancel} type="button">
          Cancel
        </button>
        {errorMessage ? (
          <button onClick={onRetry} type="button">
            Retry
          </button>
        ) : (
          <button onClick={onContinueAnyway} type="button">
            Continue anyway
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};
