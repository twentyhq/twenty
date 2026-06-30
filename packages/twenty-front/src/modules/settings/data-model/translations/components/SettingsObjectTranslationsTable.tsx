import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { SearchInput } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import {
  SettingsObjectTranslationsRow,
  TRANSLATION_ROW_GRID_TEMPLATE,
} from '@/settings/data-model/translations/components/SettingsObjectTranslationsRow';
import { type TranslationBenchStatusFilter } from '@/settings/data-model/translations/types/TranslationBenchStatusFilter';
import { type WorkspaceTranslationBenchEntry } from '@/settings/data-model/translations/hooks/useWorkspaceTranslationBench';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type SettingsObjectTranslationsTableProps = {
  entries: WorkspaceTranslationBenchEntry[];
  localeLabel: string;
  applicationId: string | null;
  status: TranslationBenchStatusFilter;
  disabled?: boolean;
  onSave: (key: string, value: string | null) => Promise<boolean>;
};

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const getStatus = (
  entry: WorkspaceTranslationBenchEntry,
  value: string,
): TranslationBenchStatusFilter => {
  if (value.trim() !== '') {
    return 'overridden';
  }

  if (entry.shipped !== '' && entry.shipped !== entry.source) {
    return 'translated';
  }

  return 'untranslated';
};

export const SettingsObjectTranslationsTable = ({
  entries,
  localeLabel,
  applicationId,
  status,
  disabled,
  onSave,
}: SettingsObjectTranslationsTableProps) => {
  const { t } = useLingui();

  const [valuesByKey, setValuesByKey] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      entries.map((entry) => [entry.key, entry.override ?? '']),
    ),
  );
  const [savedByKey, setSavedByKey] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      entries.map((entry) => [entry.key, (entry.override ?? '').trim()]),
    ),
  );
  const [searchTerm, setSearchTerm] = useState('');

  const showApplication = applicationId === null;
  const normalizedSearch = normalizeSearchText(searchTerm);

  const filteredEntries = useMemo(
    () =>
      entries.filter((entry) => {
        if (applicationId !== null && entry.applicationId !== applicationId) {
          return false;
        }

        if (
          status !== 'all' &&
          getStatus(entry, valuesByKey[entry.key] ?? '') !== status
        ) {
          return false;
        }

        if (normalizedSearch === '') {
          return true;
        }

        return normalizeSearchText(
          `${entry.source} ${valuesByKey[entry.key] ?? ''}`,
        ).includes(normalizedSearch);
      }),
    [entries, applicationId, status, valuesByKey, normalizedSearch],
  );

  const persist = async (key: string) => {
    const trimmedValue = (valuesByKey[key] ?? '').trim();

    if (trimmedValue === (savedByKey[key] ?? '')) {
      return;
    }

    const isSuccessful = await onSave(
      key,
      trimmedValue === '' ? null : trimmedValue,
    );

    if (isSuccessful) {
      setSavedByKey((previous) => ({ ...previous, [key]: trimmedValue }));
    }
  };

  const handleChange = (key: string, value: string) => {
    setValuesByKey((previous) => ({ ...previous, [key]: value }));
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <>
      <StyledSearchInputContainer>
        <SearchInput
          placeholder={t`Search a label`}
          value={searchTerm}
          onChange={setSearchTerm}
        />
      </StyledSearchInputContainer>
      {filteredEntries.length === 0 ? (
        <SettingsEmptyPlaceholder>{t`No label found`}</SettingsEmptyPlaceholder>
      ) : (
        <Table>
          <TableRow gridTemplateColumns={TRANSLATION_ROW_GRID_TEMPLATE}>
            <TableHeader>{t`Original`}</TableHeader>
            <TableHeader>{localeLabel}</TableHeader>
            {showApplication ? (
              <TableHeader>{t`Application`}</TableHeader>
            ) : (
              <TableHeader align="right">{t`Used in`}</TableHeader>
            )}
          </TableRow>
          {filteredEntries.map((entry) => (
            <SettingsObjectTranslationsRow
              key={`${entry.applicationId}:${entry.key}`}
              source={entry.source}
              placeholder={entry.shipped}
              value={valuesByKey[entry.key] ?? ''}
              applicationId={entry.applicationId}
              usageCount={entry.usageCount}
              showApplication={showApplication}
              disabled={disabled}
              onChange={(nextValue) => handleChange(entry.key, nextValue)}
              onBlur={() => persist(entry.key)}
            />
          ))}
        </Table>
      )}
    </>
  );
};
