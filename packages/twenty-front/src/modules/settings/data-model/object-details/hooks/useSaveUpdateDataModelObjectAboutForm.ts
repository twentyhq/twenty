import { useApolloClient } from '@apollo/client/react';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange } from '@/settings/data-model/object-details/utils/computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange';
import { type SettingsDataModelObjectAboutFormValues } from '@/settings/data-model/validation-schemas/settingsDataModelObjectAboutFormSchema';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useState } from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'twenty-shared/i18n';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { parseThemeColor } from 'twenty-ui/utilities';
import { useLocaleOptions } from '~/localization/hooks/useLocaleOptions';
import { MetadataTranslationsDocument } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { updatedObjectNamePluralState } from '~/pages/settings/data-model/states/updatedObjectNamePluralState';

export const TRANSLATION_INTENT_MODAL_ID =
  'object-label-translation-intent-modal';

const OBJECT_TRANSLATABLE_PROPERTIES =
  TRANSLATABLE_PROPERTIES_BY_METADATA_NAME.objectMetadata;

type ObjectTranslatableProperty =
  (typeof OBJECT_TRANSLATABLE_PROPERTIES)[number];

// The translate-vs-rename save state machine behind the About form: a label
// edit made through a translation prompts for intent; every other save is a
// plain canonical update.
export const useSaveUpdateDataModelObjectAboutForm = ({
  objectMetadataItem,
  formConfig,
  readonly,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  formConfig: UseFormReturn<SettingsDataModelObjectAboutFormValues>;
  readonly: boolean;
}) => {
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const isCustomObject = getIsMetadataItemCustom(objectMetadataItem);
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

  const { description, icon, isLabelSyncedWithName, namePlural, nameSingular } =
    objectMetadataItem;

  const pickDirtyTranslatableProperties = (): ObjectTranslatableProperty[] =>
    OBJECT_TRANSLATABLE_PROPERTIES.filter((property) =>
      isDefined(formConfig.formState.dirtyFields[property]),
    );

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

  const saveAsRename = async (
    formValues: SettingsDataModelObjectAboutFormValues,
  ) => {
    const objectNamePluralForRedirection =
      formValues.namePlural ?? objectMetadataItem.namePlural;

    setUpdatedObjectNamePlural(objectNamePluralForRedirection);
    const updateResult = await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: pickDirtyValues(formValues),
    });

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

  const cancelPendingSave = () => {
    setPendingFormValues(null);
    formConfig.reset();
  };

  return {
    handleSave,
    saveAsTranslation,
    handleRenameForAllLanguages,
    cancelPendingSave,
    currentLanguageLabel,
  };
};
