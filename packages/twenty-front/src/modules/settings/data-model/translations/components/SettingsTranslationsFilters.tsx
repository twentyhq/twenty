import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type SelectOption } from 'twenty-ui/input';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type TranslationBenchStatusFilter } from '@/settings/data-model/translations/types/TranslationBenchStatusFilter';
import { Select } from '@/ui/input/components/Select';

type SettingsTranslationsFiltersProps = {
  localeValue: string;
  localeOptions: SelectOption<string>[];
  onLocaleChange: (value: string) => void;
  applicationValue: string | null;
  applicationOptions: SelectOption<string | null>[];
  onApplicationChange: (value: string | null) => void;
  statusValue: TranslationBenchStatusFilter;
  onStatusChange: (value: TranslationBenchStatusFilter) => void;
};

const StyledCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledFiltersGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr 1fr;
`;

const StyledFullWidthField = styled.div`
  grid-column: 1 / -1;
`;

export const SettingsTranslationsFilters = ({
  localeValue,
  localeOptions,
  onLocaleChange,
  applicationValue,
  applicationOptions,
  onApplicationChange,
  statusValue,
  onStatusChange,
}: SettingsTranslationsFiltersProps) => {
  const { t } = useLingui();

  const statusOptions: SelectOption<TranslationBenchStatusFilter>[] = [
    { label: t`All`, value: 'all' },
    { label: t`Untranslated`, value: 'untranslated' },
    { label: t`Overridden`, value: 'overridden' },
  ];

  return (
    <Card
      rounded
      fullWidth
      backgroundColor={themeCssVariables.background.secondary}
    >
      <StyledCardContent>
        <StyledFiltersGrid>
          <StyledFullWidthField>
            <Select<string>
              dropdownId="settings-translations-locale"
              label={t`Language`}
              fullWidth
              withSearchInput
              dropdownWidthAuto
              value={localeValue}
              options={localeOptions}
              onChange={onLocaleChange}
            />
          </StyledFullWidthField>
          <Select<string | null>
            dropdownId="settings-translations-application"
            label={t`Application`}
            fullWidth
            withSearchInput
            value={applicationValue}
            options={applicationOptions}
            onChange={onApplicationChange}
          />
          <Select<TranslationBenchStatusFilter>
            dropdownId="settings-translations-status"
            label={t`Status`}
            fullWidth
            value={statusValue}
            options={statusOptions}
            onChange={onStatusChange}
          />
        </StyledFiltersGrid>
      </StyledCardContent>
    </Card>
  );
};
