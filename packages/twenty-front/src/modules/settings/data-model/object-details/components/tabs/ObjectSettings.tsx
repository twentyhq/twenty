import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsUpdateDataModelObjectAboutForm } from '@/settings/data-model/object-details/components/SettingsUpdateDataModelObjectAboutForm';
import { SettingsObjectSearchSection } from '@/settings/data-model/object-details/components/tabs/SettingsObjectSearchSection';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, IconArchive, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type ObjectSettingsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
};

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
`;

const StyledFormSectionContainer = styled.div`
  > * {
    padding-left: 0 !important;
  }
`;

const StyledDangerButtonsContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const DELETE_OBJECT_MODAL_ID = 'delete-object-confirmation-modal';

export const ObjectSettings = ({
  objectMetadataItem,
  isDeleting,
  setIsDeleting,
}: ObjectSettingsProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();

  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const isReadOnly =
    isObjectMetadataReadOnly({ objectMetadataItem }) || isDDLLocked;

  const handleDisable = async () => {
    const result = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { isActive: false },
    });

    if (result.status === 'successful') {
      navigate(SettingsPath.Objects);
    }
  };

  const handleDelete = () => {
    openModal(DELETE_OBJECT_MODAL_ID);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const result = await deleteOneObjectMetadataItem(objectMetadataItem.id);

    if (result.status === 'successful') {
      enqueueSuccessSnackBar({
        message: t`Object deleted`,
      });
      closeModal(DELETE_OBJECT_MODAL_ID);
      navigate(SettingsPath.Objects);
      return;
    }

    setIsDeleting(false);
    closeModal(DELETE_OBJECT_MODAL_ID);
  };

  const objectLabel = objectMetadataItem.labelPlural;

  return (
    <StyledContentContainer>
      <StyledFormSectionContainer>
        <Section>
          <H2Title
            title={t`About`}
            description={t`Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms.`}
          />
          <SettingsUpdateDataModelObjectAboutForm
            objectMetadataItem={objectMetadataItem}
          />
        </Section>
      </StyledFormSectionContainer>
      <StyledFormSectionContainer>
        <Section>
          <H2Title
            title={t`Options`}
            description={t`Choose the fields that will identify your records`}
          />
          <SettingsDataModelObjectSettingsFormCard
            objectMetadataItem={objectMetadataItem}
          />
        </Section>
      </StyledFormSectionContainer>
      <AdvancedSettingsWrapper>
        <StyledFormSectionContainer>
          <Section>
            <H2Title
              title={t`Search`}
              description={t`Configure how this object appears in search results`}
            />
            <SettingsObjectSearchSection
              objectMetadataItem={objectMetadataItem}
              isReadOnly={isReadOnly}
            />
          </Section>
        </StyledFormSectionContainer>
      </AdvancedSettingsWrapper>
      {!isReadOnly && (
        <StyledFormSectionContainer>
          <Section>
            <H2Title
              title={t`Danger zone`}
              description={t`Deactivate object`}
            />
            <StyledDangerButtonsContainer>
              <Button
                Icon={IconArchive}
                title={t`Deactivate`}
                size="small"
                onClick={handleDisable}
              />
              {objectMetadataItem.isCustom && (
                <Button
                  Icon={IconTrash}
                  title={t`Delete`}
                  size="small"
                  accent="danger"
                  variant="secondary"
                  onClick={handleDelete}
                />
              )}
            </StyledDangerButtonsContainer>
          </Section>
        </StyledFormSectionContainer>
      )}
      <ConfirmationModal
        modalInstanceId={DELETE_OBJECT_MODAL_ID}
        title={t`Delete ${objectLabel} object?`}
        subtitle={t`This will permanently delete the object and all its records. Type "yes" to confirm.`}
        confirmButtonText={t`Delete`}
        onConfirmClick={confirmDelete}
        onClose={() => closeModal(DELETE_OBJECT_MODAL_ID)}
        confirmationValue="yes"
        confirmationPlaceholder="yes"
        loading={isDeleting}
      />
    </StyledContentContainer>
  );
};
