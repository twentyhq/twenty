import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import {
  TRANSLATION_INTENT_MODAL_ID,
  useSaveUpdateDataModelObjectAboutForm,
} from '@/settings/data-model/object-details/hooks/useSaveUpdateDataModelObjectAboutForm';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import {
  type SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { parseThemeColor } from 'twenty-ui/utilities';

type SettingsUpdateDataModelObjectAboutFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const SettingsUpdateDataModelObjectAboutForm = ({
  objectMetadataItem,
}: SettingsUpdateDataModelObjectAboutFormProps) => {
  const { t } = useLingui();
  const isDDLLocked = useAtomStateValue(isDDLLockedState);
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const isCustomObject = getIsMetadataItemCustom(objectMetadataItem);
  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;

  const {
    description,
    icon,
    isLabelSyncedWithName,
    labelPlural,
    labelSingular,
    namePlural,
    nameSingular,
  } = objectMetadataItem;
  const formConfig = useForm<SettingsDataModelObjectAboutFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(settingsDataModelObjectAboutFormSchema),
    defaultValues: {
      description,
      icon: icon ?? undefined,
      isLabelSyncedWithName,
      labelPlural,
      labelSingular,
      namePlural,
      nameSingular,
      ...(isCustomObject
        ? { color: parseThemeColor(objectMetadataItem.color) }
        : {}),
    },
  });

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
      <ConfirmationModal
        modalInstanceId={TRANSLATION_INTENT_MODAL_ID}
        title={t`Translate or rename?`}
        subtitle={t`You are editing the ${currentLanguageLabel} translation. Renaming instead changes the source label, for every language.`}
        confirmButtonText={t`Only in ${currentLanguageLabel}`}
        confirmButtonAccent="blue"
        hideCancelButton
        onConfirmClick={saveAsTranslation}
        onClose={cancelPendingSave}
        AdditionalButtons={
          <StyledCenteredButton
            title={t`Rename for all languages`}
            variant="secondary"
            fullWidth
            justify="center"
            onClick={handleRenameForAllLanguages}
          />
        }
      />
    </FormProvider>
  );
};
