import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconFilter } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

import { SettingsUnsubscribersFilterMenuContent } from '@/settings/unsubscribers/components/filter-dropdown/SettingsUnsubscribersFilterMenuContent';
import { SettingsUnsubscribersFilterOptionsContent } from '@/settings/unsubscribers/components/filter-dropdown/SettingsUnsubscribersFilterOptionsContent';
import { type SettingsUnsubscribersFilterContentId } from '@/settings/unsubscribers/components/filter-dropdown/types/SettingsUnsubscribersFilterContentId';
import { type SettingsUnsubscribersFilterOption } from '@/settings/unsubscribers/components/filter-dropdown/types/SettingsUnsubscribersFilterOption';
import { SETTINGS_UNSUBSCRIBERS_ALL_FILTER } from '@/settings/unsubscribers/constants/SettingsUnsubscribersAllFilter';
import { getMessageSuppressionReasonBadge } from '@/settings/unsubscribers/utils/getMessageSuppressionReasonBadge';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
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

  const [contentId, setContentId] =
    useState<SettingsUnsubscribersFilterContentId | null>(null);

  const goToMenu = () => setContentId(null);

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

  const renderContent = () => {
    switch (contentId) {
      case 'reason':
        return (
          <SettingsUnsubscribersFilterOptionsContent
            title={t`Reason`}
            options={reasonOptions}
            selectedValue={reasonValue}
            onSelect={onChangeReason}
            onBack={goToMenu}
          />
        );
      case 'topic':
        return (
          <SettingsUnsubscribersFilterOptionsContent
            title={t`Topic`}
            options={topicOptions}
            selectedValue={topicValue}
            onSelect={onChangeTopic}
            onBack={goToMenu}
          />
        );
      default:
        return (
          <SettingsUnsubscribersFilterMenuContent
            reasonLabel={getOptionLabel(reasonOptions, reasonValue)}
            topicLabel={getOptionLabel(topicOptions, topicValue)}
            hasActiveFilters={hasActiveFilters}
            onContentChange={setContentId}
            onClear={onClear}
          />
        );
    }
  };

  return (
    <Dropdown
      dropdownId={SETTINGS_UNSUBSCRIBERS_FILTER_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 8 }}
      onClose={goToMenu}
      clickableComponent={
        <Button
          Icon={IconFilter}
          size="medium"
          variant="secondary"
          accent="default"
          ariaLabel={t`Filter unsubscribers`}
        />
      }
      dropdownComponents={renderContent()}
    />
  );
};
