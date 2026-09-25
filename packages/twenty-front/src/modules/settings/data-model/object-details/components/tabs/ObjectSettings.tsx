import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { AdvancedSettingsWrapper } from '@/settings/components/AdvancedSettingsWrapper';
import { SettingsUpdateDataModelObjectAboutForm } from '@/settings/data-model/object-details/components/SettingsUpdateDataModelObjectAboutForm';
import { SettingsObjectIndexesSection } from '@/settings/data-model/object-details/components/tabs/SettingsObjectIndexesSection';
import { SettingsObjectSearchSection } from '@/settings/data-model/object-details/components/tabs/SettingsObjectSearchSection';
import { SettingsDataModelObjectSettingsFormCard } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectSettingsFormCard';
import {
  type SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { SettingsTranslationsCard } from '@/settings/translations/components/SettingsTranslationsCard';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useForm } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { isEmptyObject } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconArchive, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
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
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();
  const { enqueueToast } = useToast();
  const { openDialog, closeDialog } = useDialog();

  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const aboutFormConfig = useForm<SettingsDataModelObjectAboutFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
    defaultValues: {
      description: objectMetadataItem.description,
      icon: objectMetadataItem.icon ?? undefined,
      isLabelSyncedWithName: objectMetadataItem.isLabelSyncedWithName,
      labelPlural: objectMetadataItem.labelPlural,
      labelSingular: objectMetadataItem.labelSingular,
      namePlural: objectMetadataItem.namePlural,
      nameSingular: objectMetadataItem.nameSingular,
      ...(getIsMetadataItemCustom(objectMetadataItem)
        ? { color: getObjectColorWithFallback(objectMetadataItem) }
        : {}),
    },
  });
  const hasUnsavedAboutEdits = !isEmptyObject(
    aboutFormConfig.formState.dirtyFields,
  );

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
    openDialog(DELETE_OBJECT_MODAL_ID);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    const result = await deleteOneObjectMetadataItem(objectMetadataItem.id);

    if (result.status === 'successful') {
      enqueueToast({ variant: 'success', children: t`Object deleted` });
      closeDialog(DELETE_OBJECT_MODAL_ID);
      navigate(SettingsPath.Objects);
      return;
    }

    setIsDeleting(false);
    closeDialog(DELETE_OBJECT_MODAL_ID);
  };

  const objectLabel = objectMetadataItem.labelPlural;

  return (
    <StyledContentContainer>
      <StyledFormSectionContainer>
        <Section.Root>
          <Section.Header
            title={t`About`}
            description={t`Name in both singular (e.g., 'Invoice') and plural (e.g., 'Invoices') forms.`}
          />
          <SettingsUpdateDataModelObjectAboutForm
            objectMetadataItem={objectMetadataItem}
            formConfig={aboutFormConfig}
          />
        </Section.Root>
      </StyledFormSectionContainer>
      <StyledFormSectionContainer>
        <Section.Root>
          <Section.Header
            title={t`Options`}
            description={t`Choose the fields that will identify your records`}
          />
          <SettingsDataModelObjectSettingsFormCard
            objectMetadataItem={objectMetadataItem}
          />
        </Section.Root>
      </StyledFormSectionContainer>
      <StyledFormSectionContainer>
        <Section.Root>
          <Section.Header
            title={t`Translations`}
            description={t`What each language displays for this object's labels`}
          />
          <SettingsTranslationsCard
            objectNamePlural={objectMetadataItem.namePlural}
            disabled={hasUnsavedAboutEdits}
          />
        </Section.Root>
      </StyledFormSectionContainer>
      <AdvancedSettingsWrapper>
        <StyledFormSectionContainer>
          <Section.Root>
            <Section.Header
              title={t`Search`}
              description={t`Configure how this object appears in search results`}
            />
            <SettingsObjectSearchSection
              objectMetadataItem={objectMetadataItem}
              isReadOnly={isReadOnly}
            />
          </Section.Root>
        </StyledFormSectionContainer>
      </AdvancedSettingsWrapper>
      <AdvancedSettingsWrapper>
        <StyledFormSectionContainer>
          <Section.Root>
            <Section.Header
              title={t`Indexes`}
              description={t`Speed up reads on the fields you filter or sort by most. Each index also slows down writes and uses disk space, so add them with intent.`}
            />
            <SettingsObjectIndexesSection
              objectMetadataItem={objectMetadataItem}
              isReadOnly={isReadOnly}
            />
          </Section.Root>
        </StyledFormSectionContainer>
      </AdvancedSettingsWrapper>
      {!isReadOnly && (
        <StyledFormSectionContainer>
          <Section.Root>
            <Section.Header
              title={t`Danger zone`}
              description={t`Deactivate object`}
            />
            <StyledDangerButtonsContainer>
              <Button
                startIcon={<IconArchive />}
                size="sm"
                onClick={handleDisable}
              >{t`Deactivate`}</Button>
              {getIsMetadataItemCustom(objectMetadataItem) && (
                <Button
                  startIcon={<IconTrash />}
                  size="sm"
                  onClick={handleDelete}
                  variant="outline"
                  color="danger"
                >{t`Delete`}</Button>
              )}
            </StyledDangerButtonsContainer>
          </Section.Root>
        </StyledFormSectionContainer>
      )}
      <ConfirmationDialog
        dialogId={DELETE_OBJECT_MODAL_ID}
        title={t`Delete ${objectLabel} object?`}
        subtitle={t`This will permanently delete the object and all its records. Type "yes" to confirm.`}
        confirmButtonText={t`Delete`}
        onConfirmClick={confirmDelete}
        onClose={() => closeDialog(DELETE_OBJECT_MODAL_ID)}
        confirmationValue="yes"
        confirmationPlaceholder="yes"
        loading={isDeleting}
      />
    </StyledContentContainer>
  );
};
