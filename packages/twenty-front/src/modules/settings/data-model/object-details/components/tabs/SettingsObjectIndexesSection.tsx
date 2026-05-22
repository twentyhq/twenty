import { useDeleteOneIndexMetadataItem } from '@/object-metadata/hooks/useDeleteOneIndexMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsObjectCreateIndexModal } from '@/settings/data-model/object-details/components/tabs/SettingsObjectCreateIndexModal';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconPlus } from 'twenty-ui/display';
import { Button, Toggle } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { MAX_CUSTOM_INDEXES_PER_OBJECT } from '~/pages/settings/data-model/constants/MaxCustomIndexesPerObject';
import { SettingsObjectIndexTable } from '~/pages/settings/data-model/SettingsObjectIndexTable';
import { type SettingsObjectIndexesTableItem } from '~/pages/settings/data-model/types/SettingsObjectIndexesTableItem';

type SettingsObjectIndexesSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
`;

const StyledToggleLabel = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const CREATE_INDEX_MODAL_ID = 'create-index-modal';
const DELETE_INDEX_MODAL_ID = 'delete-index-modal';

export const SettingsObjectIndexesSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectIndexesSectionProps) => {
  const { t } = useLingui();
  const { openModal, closeModal } = useModal();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { deleteOneIndexMetadataItem } = useDeleteOneIndexMetadataItem();

  const [showSystemIndexes, setShowSystemIndexes] = useState(false);
  const [pendingDelete, setPendingDelete] =
    useState<SettingsObjectIndexesTableItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const customIndexCount = objectMetadataItem.indexMetadatas.filter(
    (indexMetadata) => indexMetadata.isCustom,
  ).length;

  const reachedCap = customIndexCount >= MAX_CUSTOM_INDEXES_PER_OBJECT;
  const canCreate = !isReadOnly && !reachedCap;

  const handleClickAdd = () => {
    openModal(CREATE_INDEX_MODAL_ID);
  };

  const handleRequestDelete = (item: SettingsObjectIndexesTableItem) => {
    setPendingDelete(item);
    openModal(DELETE_INDEX_MODAL_ID);
  };

  const handleConfirmDelete = async () => {
    if (pendingDelete === null) return;
    setIsDeleting(true);

    const result = await deleteOneIndexMetadataItem({
      idToDelete: pendingDelete.id,
    });

    setIsDeleting(false);
    closeModal(DELETE_INDEX_MODAL_ID);

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({
        message: t`Index deleted`,
      });
      setPendingDelete(null);
    }
  };

  return (
    <StyledContent>
      <StyledHeader>
        <StyledToggleLabel>
          <Toggle
            value={showSystemIndexes}
            onChange={setShowSystemIndexes}
            toggleSize="small"
          />
          {t`Show system indexes`}
        </StyledToggleLabel>
        {!isReadOnly && (
          <Button
            Icon={IconPlus}
            title={t`Add Index`}
            size="small"
            variant="secondary"
            onClick={handleClickAdd}
            disabled={!canCreate}
            ariaLabel={
              reachedCap
                ? t`Custom index limit of ${MAX_CUSTOM_INDEXES_PER_OBJECT} reached. Delete one to add another.`
                : undefined
            }
          />
        )}
      </StyledHeader>
      <SettingsObjectIndexTable
        objectMetadataItem={objectMetadataItem}
        showSystemIndexes={showSystemIndexes}
        isReadOnly={isReadOnly}
        onDeleteIndex={handleRequestDelete}
      />
      <SettingsObjectCreateIndexModal
        modalInstanceId={CREATE_INDEX_MODAL_ID}
        objectMetadataItem={objectMetadataItem}
      />
      <ConfirmationModal
        modalInstanceId={DELETE_INDEX_MODAL_ID}
        title={t`Delete this index?`}
        subtitle={t`Queries that relied on it will fall back to a sequential scan. You can recreate it later.`}
        confirmButtonText={t`Delete`}
        onConfirmClick={handleConfirmDelete}
        onClose={() => setPendingDelete(null)}
        loading={isDeleting}
      />
    </StyledContent>
  );
};
