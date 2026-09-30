import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';
import { IconFilter } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { SettingsUnsubscribersFilterMenuContent } from '@/settings/unsubscribers/components/filter-dropdown/SettingsUnsubscribersFilterMenuContent';
import { SettingsUnsubscribersFilterOptionsContent } from '@/settings/unsubscribers/components/filter-dropdown/SettingsUnsubscribersFilterOptionsContent';
import { type SettingsUnsubscribersFilterOption } from '@/settings/unsubscribers/components/filter-dropdown/types/SettingsUnsubscribersFilterOption';
import { SETTINGS_UNSUBSCRIBERS_ALL_FILTER } from '@/settings/unsubscribers/constants/SettingsUnsubscribersAllFilter';
import { getMessageSuppressionReasonBadge } from '@/settings/unsubscribers/utils/getMessageSuppressionReasonBadge';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import {
  MessageSuppressionReason,
  type UnsubscribeTopicsQuery,
} from '~/generated-metadata/graphql';

const SETTINGS_UNSUBSCRIBERS_FILTER_DROPDOWN_ID =
  'settings-unsubscribers-filter-dropdown';

const getOptionLabel = (
  options: SettingsUnsubscribersFilterOption[],
  value: string,
) => options.find((option) => option.value === value)?.label ?? '';

type SettingsUnsubscribersFilterDropdownProps = {
  topics: UnsubscribeTopicsQuery['unsubscribeTopics'];
  reasonValue: string;
  topicValue: string;
  onChangeReason: (value: string) => void;
  onChangeTopic: (value: string) => void;
  onClear: () => void;
};

export const SettingsUnsubscribersFilterDropdown = ({
  topics,
  reasonValue,
  topicValue,
  onChangeReason,
  onChangeTopic,
  onClear,
}: SettingsUnsubscribersFilterDropdownProps) => {
  const { t } = useLingui();

  const reasonOptions: SettingsUnsubscribersFilterOption[] = [
    { value: SETTINGS_UNSUBSCRIBERS_ALL_FILTER, label: t`All reasons` },
    ...Object.values(MessageSuppressionReason).map((reason) => ({
      value: reason,
      label: getMessageSuppressionReasonBadge(reason).label,
    })),
  ];

  const topicOptions: SettingsUnsubscribersFilterOption[] = [
    { value: SETTINGS_UNSUBSCRIBERS_ALL_FILTER, label: t`All topics` },
    ...topics.map((topic) => ({
      value: topic.id,
      label: topic.name ?? t`Untitled topic`,
    })),
  ];

  const hasActiveFilters =
    reasonValue !== SETTINGS_UNSUBSCRIBERS_ALL_FILTER ||
    topicValue !== SETTINGS_UNSUBSCRIBERS_ALL_FILTER;

  return (
    <DropdownRoot
      dropdownId={SETTINGS_UNSUBSCRIBERS_FILTER_DROPDOWN_ID}
      type="picker"
    >
      <Dropdown.Trigger
        render={
          <Button
            startIcon={<IconFilter />}
            size="md"
            aria-label={t`Filter opt-outs`}
            variant="outline"
          />
        }
      />
      <DropdownContent align="end" sideOffset={8}>
        <Dropdown.Page id="root">
          <SettingsUnsubscribersFilterMenuContent
            reasonLabel={getOptionLabel(reasonOptions, reasonValue)}
            topicLabel={getOptionLabel(topicOptions, topicValue)}
            hasActiveFilters={hasActiveFilters}
            onClear={onClear}
          />
        </Dropdown.Page>
        <Dropdown.Page id="reason">
          <SettingsUnsubscribersFilterOptionsContent
            title={t`Reason`}
            options={reasonOptions}
            selectedValue={reasonValue}
            onSelect={onChangeReason}
          />
        </Dropdown.Page>
        <Dropdown.Page id="topic">
          <SettingsUnsubscribersFilterOptionsContent
            title={t`Topic`}
            options={topicOptions}
            selectedValue={topicValue}
            onSelect={onChangeTopic}
          />
        </Dropdown.Page>
      </DropdownContent>
    </DropdownRoot>
  );
};
