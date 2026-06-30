import { i18n } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { APP_LOCALES } from 'twenty-shared/translations';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/typography';
import { Section } from 'twenty-ui/layout';

import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLocaleOptions } from '@/localization/hooks/useLocaleOptions';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsObjectTranslationsTable } from '@/settings/data-model/translations/components/SettingsObjectTranslationsTable';
import { SettingsTranslationsFilters } from '@/settings/data-model/translations/components/SettingsTranslationsFilters';
import { useWorkspaceTranslationBench } from '@/settings/data-model/translations/hooks/useWorkspaceTranslationBench';
import { type TranslationBenchStatusFilter } from '@/settings/data-model/translations/types/TranslationBenchStatusFilter';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const isTranslatableLocale = (locale: string): boolean =>
  locale !== APP_LOCALES.en && locale !== APP_LOCALES['pseudo-en'];

export const SettingsTranslations = () => {
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const localeOptions = useLocaleOptions().filter((option) =>
    isTranslatableLocale(option.value),
  );

  const [selectedLocale, setSelectedLocale] = useState<string>(() =>
    isTranslatableLocale(i18n.locale)
      ? i18n.locale
      : (localeOptions[0]?.value ?? ''),
  );
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [status, setStatus] = useState<TranslationBenchStatusFilter>('all');

  const { entries, loading, updateTranslation } =
    useWorkspaceTranslationBench(selectedLocale);

  const localeLabel =
    localeOptions.find((option) => option.value === selectedLocale)?.label ??
    selectedLocale;

  const applicationOptions: SelectOption<string | null>[] = useMemo(() => {
    const getApplicationLabel = (applicationId: string): string => {
      const application = currentWorkspace?.installedApplications.find(
        (installedApplication) => installedApplication.id === applicationId,
      );

      if (!isDefined(application)) {
        return applicationId;
      }

      if (isTwentyStandardApplication(application)) {
        return t`Standard`;
      }

      if (isWorkspaceCustomApplication(application, currentWorkspace)) {
        return t`Custom`;
      }

      return application.name;
    };

    const distinctApplicationIds = [
      ...new Set(entries.map((entry) => entry.applicationId)),
    ];

    return [
      { label: t`All applications`, value: null },
      ...distinctApplicationIds
        .map((applicationId) => ({
          label: getApplicationLabel(applicationId),
          value: applicationId,
        }))
        .sort((optionA, optionB) => optionA.label.localeCompare(optionB.label)),
    ];
  }, [entries, currentWorkspace, t]);

  const handleSave = async (
    key: string,
    value: string | null,
  ): Promise<boolean> => {
    try {
      await updateTranslation(key, value);

      return true;
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error && isNonEmptyString(error.message)
            ? error.message
            : t`Failed to save translation`,
      });

      return false;
    }
  };

  return (
    <SettingsPageLayout
      title={t`Translations`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: t`Translations`,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Translations`}
            description={t`Translate your workspace's labels into other languages. Each label is translated once and applies everywhere it is used. Empty values fall back to the original. Changes save automatically.`}
          />
          <SettingsTranslationsFilters
            localeValue={selectedLocale}
            localeOptions={localeOptions}
            onLocaleChange={setSelectedLocale}
            applicationValue={selectedApplicationId}
            applicationOptions={applicationOptions}
            onApplicationChange={setSelectedApplicationId}
            statusValue={status}
            onStatusChange={setStatus}
          />
        </Section>
        <Section>
          {loading && entries.length === 0 ? null : (
            <SettingsObjectTranslationsTable
              key={selectedLocale}
              entries={entries}
              localeLabel={localeLabel}
              applicationId={selectedApplicationId}
              status={status}
              onSave={handleSave}
            />
          )}
        </Section>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
