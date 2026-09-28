import { Button } from 'twenty-ui/primitives/input';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import {
  TRANSLATION_INTENT_MODAL_ID,
  useSaveUpdateDataModelObjectAboutForm,
} from '@/settings/data-model/object-details/hooks/useSaveUpdateDataModelObjectAboutForm';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import { type SettingsDataModelObjectAboutFormValues } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, type UseFormReturn } from 'react-hook-form';

const StyledCenteredButton = styled(Button)`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsUpdateDataModelObjectAboutFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  formConfig: UseFormReturn<SettingsDataModelObjectAboutFormValues>;
};

export const SettingsUpdateDataModelObjectAboutForm = ({
  objectMetadataItem,
  formConfig,
}: SettingsUpdateDataModelObjectAboutFormProps) => {
  const { t } = useLingui();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);
  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;

  const {
    handleSave,
    saveAsTranslation,
    handleRenameForAllLanguages,
    cancelPendingSave,
    currentLanguageLabel,
  } = useSaveUpdateDataModelObjectAboutForm({
    objectMetadataItem,
    formConfig,
    readonly,
  });

  return (
    // oxlint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SettingsDataModelObjectAboutForm
        onNewDirtyField={() => formConfig.handleSubmit(handleSave)()}
        disableEdition={readonly}
        objectMetadataItem={objectMetadataItem}
      />
      <ConfirmationDialog
        dialogId={TRANSLATION_INTENT_MODAL_ID}
        title={t`Translate or rename?`}
        subtitle={t`You are editing the ${currentLanguageLabel} translation. Renaming instead changes the source label, for every language.`}
        confirmButtonText={t`Only in ${currentLanguageLabel}`}
        confirmButtonColor="accent"
        hideCancelButton
        onConfirmClick={saveAsTranslation}
        onClose={cancelPendingSave}
        AdditionalButtons={
          <StyledCenteredButton
            fullWidth
            onClick={handleRenameForAllLanguages}
            variant="outline"
          >{t`Rename for all languages`}</StyledCenteredButton>
        }
      />
    </FormProvider>
  );
};
