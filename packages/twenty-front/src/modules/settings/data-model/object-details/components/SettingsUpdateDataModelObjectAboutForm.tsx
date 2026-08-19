import { useApolloClient } from '@apollo/client/react';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange } from '@/settings/data-model/object-details/utils/computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange';
import { SettingsDataModelObjectAboutForm } from '@/settings/data-model/objects/forms/components/SettingsDataModelObjectAboutForm';
import {
  type SettingsDataModelObjectAboutFormValues,
  settingsDataModelObjectAboutFormSchema,
} from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import {
  ConfirmationModal,
  StyledCenteredButton,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { parseThemeColor } from 'twenty-ui/utilities';
import { useLocaleOptions } from '~/localization/hooks/useLocaleOptions';
import { MetadataTranslationsDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';

type SettingsUpdateDataModelObjectAboutFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const TRANSLATION_INTENT_MODAL_ID = 'object-label-translation-intent-modal';

const OBJECT_TRANSLATABLE_PROPERTIES =
  TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.objectMetadata;

type ObjectTranslatableProperty =
  (typeof OBJECT_TRANSLATABLE_PROPERTIES)[number];

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
  const navigate = useNavigateSettings();
  const setUpdatedObjectNamePlural = useSetAtomState(
    updatedObjectNamePluralState,
  );
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();
  const apolloClient = useApolloClient();
  const { openModal, closeModal } = useModal();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;
  const localeOptions = useLocaleOptions();
  const currentLanguageLabel =
    localeOptions.find(({ value }) => value === currentLocale)?.label ??
    currentLocale;
  const [pendingFormValues, setPendingFormValues] =
    useState<SettingsDataModelObjectAboutFormValues | null>(null);

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

  const pickDirtyTranslatableProperties = (): ObjectTranslatableProperty[] =>
    OBJECT_TRANSLATABLE_PROPERTIES.filter((property) =>
      isDefined(formConfig.formState.dirtyFields[property]),
    );

  const handleSave = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    if (readonly) {
      return;
    }

    if (!(Object.keys(formConfig.formState.dirtyFields).length > 0)) {
      return;
    }

    const dirtyTranslatableProperties = pickDirtyTranslatableProperties();

    // Editing a label the viewer sees through a translation is ambiguous:
    // fix the translation, or rename the concept for every language? Ask.
    if (
      dirtyTranslatableProperties.length > 0 &&
      currentLocale !== SOURCE_LOCALE
    ) {
      const { data } = await apolloClient.query({
        query: MetadataTranslationsDocument,
        variables: {
          input: {
            objectMetadataId: objectMetadataItem.id,
            locale: currentLocale,
          },
        },
        fetchPolicy: 'network-only',
      });

      const isEditingThroughTranslation = dirtyTranslatableProperties.some(
        (property) => {
          const row = data?.metadataTranslations.find(
            (translation) => translation.property === property,
          );

          return isDefined(row) && row.value !== row.canonicalValue;
        },
      );

      if (isEditingThroughTranslation) {
        setPendingFormValues(formValues);
        openModal(TRANSLATION_INTENT_MODAL_ID);
        return;
      }
    }

    await saveAsRename(formValues);
  };

  const saveAsRename = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    const objectNamePluralForRedirection =
      formValues.namePlural ?? objectMetadataItem.namePlural;

    setUpdatedObjectNamePlural(objectNamePluralForRedirection);
    const updateResult = await updateObjectMetadata(formValues);

    if (updateResult.status === 'failed') {
      return;
    }

    const updatedObject = updateResult.response;

    if (formValues.isLabelSyncedWithName !== isLabelSyncedWithName) {
      formConfig.reset({
        description,
        icon: icon ?? undefined,
        isLabelSyncedWithName: formValues.isLabelSyncedWithName,
        labelPlural: updatedObject?.data?.updateOneObject.labelPlural,
        labelSingular: updatedObject?.data?.updateOneObject.labelSingular,
        namePlural: updatedObject?.data?.updateOneObject.namePlural,
        nameSingular: updatedObject?.data?.updateOneObject.nameSingular,
        ...(isCustomObject
          ? {
              color: parseThemeColor(
                updatedObject?.data?.updateOneObject.color ??
                  objectMetadataItem.color,
              ),
            }
          : {}),
      });
    } else {
      formConfig.reset(formValues);
    }

    navigate(SettingsPath.ObjectDetail, {
      objectNamePlural: objectNamePluralForRedirection,
    });

    const updatedObjectNamePlural =
      updatedObject?.data?.updateOneObject.namePlural;

    if (!isDefined(updatedObjectNamePlural)) {
      return;
    }

    setNavigationMemorizedUrl((previousNavigationMemorizedUrl) =>
      computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange(
        previousNavigationMemorizedUrl,
        objectMetadataItem.namePlural,
        updatedObjectNamePlural,
      ),
    );
  };

  const saveAsTranslation = async () => {
    if (!isDefined(pendingFormValues)) {
      return;
    }

    const dirtyTranslatableProperties = pickDirtyTranslatableProperties();
    const translations = dirtyTranslatableProperties.map((property) => ({
      locale: currentLocale,
      property,
      value: pendingFormValues[property] ?? null,
    }));
    // With label↔name sync on, the name fields were auto-derived from the
    // label being translated (they are not editable directly in that state):
    // a translation must not rename the API.
    const isPendingLabelSyncedWithName =
      pendingFormValues.isLabelSyncedWithName ?? isLabelSyncedWithName;
    const syncDerivedNameProperties: readonly string[] =
      isPendingLabelSyncedWithName ? ['nameSingular', 'namePlural'] : [];
    // Unrelated dirty edits (icon, ...) ride along as canonical updates —
    // only the label edits become locale-scoped.
    const dirtyNonTranslatableValues = Object.fromEntries(
      Object.entries(pickDirtyValues(pendingFormValues)).filter(
        ([key]) =>
          !(OBJECT_TRANSLATABLE_PROPERTIES as readonly string[]).includes(
            key,
          ) && !syncDerivedNameProperties.includes(key),
      ),
    );

    const updateResult = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { ...dirtyNonTranslatableValues, translations },
    });

    closeModal(TRANSLATION_INTENT_MODAL_ID);
    setPendingFormValues(null);

    if (updateResult.status === 'successful') {
      // The form must reflect what was saved: the unchanged API names, not
      // the ones the sync derived from the translated label.
      formConfig.reset(
        isPendingLabelSyncedWithName
          ? { ...pendingFormValues, nameSingular, namePlural }
          : pendingFormValues,
      );
    }
  };

  const handleRenameForAllLanguages = async () => {
    if (!isDefined(pendingFormValues)) {
      return;
    }

    const formValues = pendingFormValues;

    closeModal(TRANSLATION_INTENT_MODAL_ID);
    setPendingFormValues(null);
    await saveAsRename(formValues);
  };

  // Only dirty fields are ever sent: untouched values hold the viewer-locale
  // resolved labels, and sending those back would silently turn a translation
  // into a rename. Standard objects additionally cannot change their names.
  const pickDirtyValues = (
    formValues: SettingsDataModelObjectAboutFormValues,
  ): Partial<SettingsDataModelObjectAboutFormValues> => {
    const dirtyValues = Object.fromEntries(
      Object.entries(formValues).filter(([key]) =>
        isDefined(
          formConfig.formState.dirtyFields[
            key as keyof SettingsDataModelObjectAboutFormValues
          ],
        ),
      ),
    ) as Partial<SettingsDataModelObjectAboutFormValues>;

    if (isCustomObject) {
      return dirtyValues;
    }

    const {
      nameSingular: _nameSingular,
      namePlural: _namePlural,
      isLabelSyncedWithName: _isLabelSyncedWithName,
      color: _color,
      ...dirtyValuesWithoutNames
    } = dirtyValues;

    return dirtyValuesWithoutNames;
  };

  const updateObjectMetadata = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    return await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: pickDirtyValues(formValues),
    });
  };

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
        onClose={() => {
          setPendingFormValues(null);
          formConfig.reset();
        }}
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
