import {
  LinkActivitiesDropdownContent,
  type LinkActivitiesDropdownContentProps,
} from '@/activities/components/LinkActivitiesDropdownContent';
import { useActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type ReactElement } from 'react';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type LinkActivitiesDropdownProps<
  TActivity extends { id: string },
  TSearchData,
> = LinkActivitiesDropdownContentProps<TActivity, TSearchData> & {
  activityObjectNameSingular:
    | CoreObjectNameSingular.MessageThread
    | CoreObjectNameSingular.CalendarEvent;
  dropdownIdPrefix: string;
  ariaLabel: string;
  trigger: ReactElement;
};

export const LinkActivitiesDropdown = <
  TActivity extends { id: string },
  TSearchData,
>({
  activityObjectNameSingular,
  dropdownIdPrefix,
  ariaLabel,
  trigger,
  searchQuery,
  getSearchResults,
  timelineQuery,
  getOption,
  labels,
}: LinkActivitiesDropdownProps<TActivity, TSearchData>) => {
  const targetRecord = useTargetRecord();
  const activityLinkConfig = useActivityLinkConfig({
    targetRecord,
    activityObjectNameSingular,
  });

  if (!isDefined(activityLinkConfig)) {
    return null;
  }

  return (
    <DropdownRoot
      dropdownId={`${dropdownIdPrefix}-${targetRecord.id}`}
      type="picker"
      multiple
    >
      <Dropdown.Trigger render={trigger} />
      <DropdownContent
        width={GenericDropdownContentWidth.ExtraLarge}
        align="end"
        aria-label={ariaLabel}
      >
        <LinkActivitiesDropdownContent
          targetRecord={targetRecord}
          activityLinkConfig={activityLinkConfig}
          searchQuery={searchQuery}
          getSearchResults={getSearchResults}
          timelineQuery={timelineQuery}
          getOption={getOption}
          labels={labels}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
