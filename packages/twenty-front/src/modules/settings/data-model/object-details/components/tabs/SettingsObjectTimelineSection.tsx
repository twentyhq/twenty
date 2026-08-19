import { SettingsObjectTimelineRulesTable } from '@/settings/data-model/object-details/components/SettingsObjectTimelineRulesTable';
import { type SettingsTimelineActivityRule } from '@/settings/data-model/object-details/utils/getSettingsTimelineActivityRules';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SearchInput } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type SettingsObjectTimelineSectionProps = {
  timelineActivityRules: SettingsTimelineActivityRule[];
};

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

export const SettingsObjectTimelineSection = ({
  timelineActivityRules,
}: SettingsObjectTimelineSectionProps) => {
  const { t } = useLingui();

  const [searchTerm, setSearchTerm] = useState('');

  const searchNormalized = normalizeSearchText(searchTerm);
  const filteredTimelineActivityRules =
    searchNormalized.length === 0
      ? timelineActivityRules
      : timelineActivityRules.filter((rule) =>
          normalizeSearchText(
            `${rule.sourceObjectMetadataItem.labelPlural} ${rule.viaFieldMetadataItem?.label ?? ''}`,
          ).includes(searchNormalized),
        );

  return (
    <StyledContent>
      <SearchInput
        placeholder={t`Search a rule...`}
        value={searchTerm}
        onChange={setSearchTerm}
      />
      <SettingsObjectTimelineRulesTable
        timelineActivityRules={filteredTimelineActivityRules}
      />
    </StyledContent>
  );
};
