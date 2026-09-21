import { Button } from 'twenty-ui/primitives/input';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';

const StyledCenteredButton = styled(Button)`
  box-sizing: border-box;
  margin-top: ${themeCssVariables.spacing[2]};
`;

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
        ? { color: getObjectColorWithFallback(objectMetadataItem) }
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
