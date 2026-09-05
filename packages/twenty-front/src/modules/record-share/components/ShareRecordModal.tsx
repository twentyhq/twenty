import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconX } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ShareRecordModalContent } from '@/record-share/components/ShareRecordModalContent';
import { SHARE_RECORD_MODAL_ID } from '@/record-share/constants/ShareRecordModalId';
import { shareRecordModalTargetState } from '@/record-share/states/shareRecordModalTargetState';
import { type ShareRecordModalTarget } from '@/record-share/types/ShareRecordModalTarget';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

type ShareRecordModalHeaderProps = {
  objectMetadataId: string;
  onClose: () => void;
};

const ShareRecordModalHeader = ({
  objectMetadataId,
  onClose,
}: ShareRecordModalHeaderProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataId,
  );
  const objectLabel = objectMetadataItem?.labelSingular;

  return (
    <StyledHeader>
      <StyledTitle>
        {isDefined(objectLabel) ? t`Share ${objectLabel}` : t`Share record`}
      </StyledTitle>
      <IconButton Icon={IconX} onClick={onClose} size="small" />
    </StyledHeader>
  );
};

type ShareRecordModalForTargetProps = {
  target: ShareRecordModalTarget;
  onClose: () => void;
};

const ShareRecordModalForTarget = ({
  target,
  onClose,
}: ShareRecordModalForTargetProps) => (
  <ModalStatefulWrapper
    modalInstanceId={SHARE_RECORD_MODAL_ID}
    size="medium"
    padding="none"
    autoHeight
    isClosable
    onClose={onClose}
    renderInDocumentBody
  >
    <ShareRecordModalHeader
      objectMetadataId={target.objectMetadataId}
      onClose={onClose}
    />
    <ShareRecordModalContent
      objectMetadataId={target.objectMetadataId}
      recordId={target.recordId}
    />
  </ModalStatefulWrapper>
);

export const ShareRecordModal = () => {
  const [shareRecordModalTarget, setShareRecordModalTarget] = useAtomState(
    shareRecordModalTargetState,
  );
  const { closeModal } = useModal();

  if (!isDefined(shareRecordModalTarget)) {
    return null;
  }

  const handleClose = () => {
    closeModal(SHARE_RECORD_MODAL_ID);
    setShareRecordModalTarget(null);
  };

  return (
    <ShareRecordModalForTarget
      key={shareRecordModalTarget.recordId}
      target={shareRecordModalTarget}
      onClose={handleClose}
    />
  );
};
