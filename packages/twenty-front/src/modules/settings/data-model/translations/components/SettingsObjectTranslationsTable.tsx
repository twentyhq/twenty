import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { SearchInput } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import {
  SettingsObjectTranslationsRow,
  TRANSLATION_ROW_GRID_TEMPLATE,
} from '@/settings/data-model/translations/components/SettingsObjectTranslationsRow';
import { type TranslationBenchStatusFilter } from '@/settings/data-model/translations/types/TranslationBenchStatusFilter';
import { type WorkspaceTranslationBenchEntry } from '@/settings/data-model/translations/hooks/useWorkspaceTranslationBench';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type SettingsObjectTranslationsTableProps = {
  entries: WorkspaceTranslationBenchEntry[];
  localeLabel: string;
  applicationId: string | null;
  status: TranslationBenchStatusFilter;
  loading?: boolean;
  disabled?: boolean;
  onSave: (key: string, value: string | null) => Promise<boolean>;
};

const SKELETON_ROW_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8'];

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
  loading,
  disabled,
  onSave,
}: SettingsObjectTranslationsTableProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);

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

  const headerRow = (
    <TableRow gridTemplateColumns={TRANSLATION_ROW_GRID_TEMPLATE}>
      <TableHeader>{t`Original`}</TableHeader>
      <TableHeader>{localeLabel}</TableHeader>
      {showApplication ? (
        <TableHeader align="right">{t`Application`}</TableHeader>
      ) : (
        <TableHeader align="right">{t`Used in`}</TableHeader>
      )}
    </TableRow>
  );

  if (loading === true && entries.length === 0) {
    return (
      <Table>
        {headerRow}
        <SkeletonTheme
          baseColor={theme.background.tertiary}
          highlightColor={theme.background.transparent.lighter}
          borderRadius={4}
        >
          {SKELETON_ROW_KEYS.map((skeletonKey) => (
            <TableRow
              key={skeletonKey}
              gridTemplateColumns={TRANSLATION_ROW_GRID_TEMPLATE}
            >
              <TableCell>
                <Skeleton width={160} height={16} />
              </TableCell>
              <TableCell>
                <Skeleton width="100%" height={16} />
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </SkeletonTheme>
      </Table>
    );
  }

  if (entries.length === 0) {
    return (
      <SettingsEmptyPlaceholder>{t`No labels to translate`}</SettingsEmptyPlaceholder>
    );
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
          {headerRow}
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
