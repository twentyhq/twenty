import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useLocaleOptions } from '@/localization/hooks/useLocaleOptions';
import { StyledSettingsDataModelTableBodyContainer } from '@/settings/data-model/components/SettingsDataModelTableBodyContainer';
import { MetadataOptionTranslationsTableRow } from '@/settings/translations/components/MetadataOptionTranslationsTableRow';
import { useMetadataTranslations } from '@/settings/translations/hooks/useMetadataTranslations';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { LEGACY_SKELETON_COLORS } from '@/ui/feedback/skeleton/constants/LEGACY_SKELETON_COLORS';
import { Select } from '@/ui/input/components/Select';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { getOptionIdFromFieldOptionLabelTranslationProperty } from 'twenty-shared/i18n';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const GRID_TEMPLATE_COLUMNS = 'minmax(0, 1fr) minmax(0, 1fr) 24px';

const StyledLocaleSelectContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

type SettingsMetadataOptionTranslationsSectionProps = {
  fieldMetadataId: string;
};

export const SettingsMetadataOptionTranslationsSection = ({
  fieldMetadataId,
}: SettingsMetadataOptionTranslationsSectionProps) => {
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const localeOptions = useLocaleOptions();
  const [locale, setLocale] = useState<string>(
    currentWorkspaceMember?.locale ?? SOURCE_LOCALE,
  );
  const { metadataTranslations, loading, saveTranslationRows } =
    useMetadataTranslations({ fieldMetadataId, locale });

  const optionLabelTranslations = metadataTranslations.filter(
    ({ property, locale: translationLocale }) =>
      translationLocale === locale &&
      isDefined(getOptionIdFromFieldOptionLabelTranslationProperty(property)),
  );

  const showSkeleton = loading && !isNonEmptyArray(optionLabelTranslations);

  return (
    <Section.Root>
      <Section.Header
        title={t`Options`}
        description={t`What each language displays for this field's options.`}
      />
      <StyledLocaleSelectContainer>
        <Select
          dropdownId="settings-metadata-option-translations-locale"
          value={locale}
          options={localeOptions.map(({ label, value }) => ({ label, value }))}
          onChange={setLocale}
          withSearchInput
          fullWidth
        />
      </StyledLocaleSelectContainer>
      <Table>
        <TableRow gridTemplateColumns={GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Option`}</TableHeader>
          <TableHeader>{t`Translation`}</TableHeader>
          <TableHeader />
        </TableRow>
        <StyledSettingsDataModelTableBodyContainer>
          <TableBody>
            {showSkeleton
              ? Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonLine
                    baseColor={LEGACY_SKELETON_COLORS.base}
                    highlightColor={LEGACY_SKELETON_COLORS.highlight}
                    height={32}
                    borderRadius={4}
                    key={index}
                  />
                ))
              : optionLabelTranslations.map((translation) => (
                  <MetadataOptionTranslationsTableRow
                    key={translation.property}
                    gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
                    translation={translation}
                    onSaveTranslationRows={saveTranslationRows}
                  />
                ))}
          </TableBody>
        </StyledSettingsDataModelTableBodyContainer>
      </Table>
    </Section.Root>
  );
};
