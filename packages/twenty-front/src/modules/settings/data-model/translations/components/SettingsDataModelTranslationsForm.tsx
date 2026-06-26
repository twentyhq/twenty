import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { APP_LOCALES } from 'twenty-shared/translations';
import { Button, type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type StandardOverrideTranslationsTarget,
  useStandardOverrideTranslations,
} from '@/settings/data-model/translations/hooks/useStandardOverrideTranslations';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';

type SettingsDataModelTranslationsFormProps = {
  target: StandardOverrideTranslationsTarget;
  sourceLabelsByKey: Record<string, string>;
  disabled?: boolean;
};

type TranslatableLabelField = {
  key: string;
  label: string;
  multiline?: boolean;
};

const getLocaleDisplayName = (locale: string): string => {
  try {
    return (
      new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale
    );
  } catch {
    return locale;
  }
};

const TRANSLATABLE_LOCALE_OPTIONS: SelectOption<string>[] = Object.values(
  APP_LOCALES,
)
  .filter(
    (locale) =>
      locale !== APP_LOCALES.en && locale !== APP_LOCALES['pseudo-en'],
  )
  .map((locale) => ({
    value: locale,
    label: getLocaleDisplayName(locale),
  }))
  .sort((optionA, optionB) => optionA.label.localeCompare(optionB.label));

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledSaveButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SettingsDataModelTranslationsForm = ({
  target,
  sourceLabelsByKey,
  disabled,
}: SettingsDataModelTranslationsFormProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar } = useSnackBar();

  const { translationsByLocale, isSaving, saveLocaleTranslations } =
    useStandardOverrideTranslations(target);

  const labelFields: TranslatableLabelField[] =
    target.kind === 'object'
      ? [
          { key: 'labelSingular', label: t`Singular Label` },
          { key: 'labelPlural', label: t`Plural Label` },
          { key: 'description', label: t`Description`, multiline: true },
        ]
      : [
          { key: 'label', label: t`Label` },
          { key: 'description', label: t`Description`, multiline: true },
        ];

  const [selectedLocale, setSelectedLocale] = useState<string>(
    TRANSLATABLE_LOCALE_OPTIONS[0].value,
  );
  const [draftsByLocale, setDraftsByLocale] = useState<
    Record<string, Record<string, string>>
  >({});

  const getStoredValue = (locale: string, key: string): string => {
    const storedValue = translationsByLocale[locale]?.[key];

    return isNonEmptyString(storedValue) ? storedValue : '';
  };

  const getDisplayValue = (key: string): string =>
    draftsByLocale[selectedLocale]?.[key] ??
    getStoredValue(selectedLocale, key);

  const handleChange = (key: string, value: string) => {
    setDraftsByLocale((previousDrafts) => ({
      ...previousDrafts,
      [selectedLocale]: {
        ...(previousDrafts[selectedLocale] ?? {}),
        [key]: value,
      },
    }));
  };

  const localeDraft = draftsByLocale[selectedLocale] ?? {};
  const isDirty = labelFields.some(
    ({ key }) =>
      key in localeDraft &&
      localeDraft[key] !== getStoredValue(selectedLocale, key),
  );

  const handleSave = async () => {
    const labelTranslations: Record<string, string | null> = {};

    for (const { key } of labelFields) {
      const value = getDisplayValue(key);

      labelTranslations[key] = isNonEmptyString(value) ? value : null;
    }

    await saveLocaleTranslations({
      locale: selectedLocale,
      labelTranslations,
    });

    setDraftsByLocale((previousDrafts) => {
      const { [selectedLocale]: _savedDraft, ...remainingDrafts } =
        previousDrafts;

      return remainingDrafts;
    });

    enqueueSuccessSnackBar({ message: t`Translations saved` });
  };

  return (
    <StyledContainer>
      <Select<string>
        dropdownId="settings-translations-locale"
        label={t`Language`}
        fullWidth
        withSearchInput
        value={selectedLocale}
        options={TRANSLATABLE_LOCALE_OPTIONS}
        onChange={setSelectedLocale}
        disabled={disabled}
      />
      {labelFields.map(({ key, label, multiline }) =>
        multiline === true ? (
          <TextArea
            key={key}
            textAreaId={`settings-translation-${key}`}
            label={label}
            placeholder={sourceLabelsByKey[key]}
            value={getDisplayValue(key)}
            onChange={(value) => handleChange(key, value)}
            minRows={2}
            maxRows={5}
            disabled={disabled}
          />
        ) : (
          <TextInput
            key={key}
            label={label}
            placeholder={sourceLabelsByKey[key]}
            value={getDisplayValue(key)}
            onChange={(value) => handleChange(key, value)}
            fullWidth
            disabled={disabled}
          />
        ),
      )}
      <StyledSaveButtonContainer>
        <Button
          title={t`Save`}
          variant="primary"
          accent="blue"
          size="small"
          disabled={disabled === true || !isDirty || isSaving}
          onClick={handleSave}
        />
      </StyledSaveButtonContainer>
    </StyledContainer>
  );
};
