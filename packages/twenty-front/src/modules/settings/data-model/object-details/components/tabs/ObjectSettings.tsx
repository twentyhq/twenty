import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { isObjectMetadataSettingsReadOnly } from '@/object-record/read-only/utils/isObjectMetadataSettingsReadOnly';
import { SettingsUpdateDataModelObjectAboutForm } from '@/settings/data-model/object-details/components/SettingsUpdateDataModelObjectAboutForm';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, IconArchive, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type ObjectSettingsProps = {
  objectMetadataItem: ObjectMetadataItem;
  onDelete: () => Promise<void>;
};

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
`;

const StyledFormSection = styled(Section)`
  padding-left: 0 !important;
`;

const StyledDangerButtonsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const DELETE_OBJECT_MODAL_ID = 'delete-object-confirmation-modal';

export const ObjectSettings = ({
  objectMetadataItem,
  onDelete,
}: ObjectSettingsProps) => {
  const { t } = useLingui();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const readonly = isObjectMetadataSettingsReadOnly({
    objectMetadataItem,
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });
  const navigate = useNavigateSettings();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { openModal, closeModal } = useModal();

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
    await onDelete();
    closeModal(DELETE_OBJECT_MODAL_ID);
  };

  const objectLabel = objectMetadataItem.labelPlural;

  return (
    <StyledContentContainer>
      <StyledFormSection>
        <H2Title
          title={t`About`}
          description={t`Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms.`}
        />
        <SettingsUpdateDataModelObjectAboutForm
          objectMetadataItem={objectMetadataItem}
        />
      </StyledFormSection>
      <StyledFormSection>
        <Section>
          <H2Title
            title={t`Options`}
            description={t`Choose the fields that will identify your records`}
          />
          <SettingsDataModelObjectSettingsFormCard
            objectMetadataItem={objectMetadataItem}
          />
        </Section>
      </StyledFormSection>
      {!readonly && (
        <StyledFormSection>
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
        </StyledFormSection>
      )}
      <ConfirmationModal
        modalId={DELETE_OBJECT_MODAL_ID}
        title={t`Delete ${objectLabel} object?`}
        subtitle={t`This will permanently delete the object and all its records. Type "yes" to confirm.`}
        confirmButtonText={t`Delete`}
        onConfirmClick={confirmDelete}
        onClose={() => closeModal(DELETE_OBJECT_MODAL_ID)}
        confirmationValue="yes"
        confirmationPlaceholder="yes"
      />
    </StyledContentContainer>
  );
};
