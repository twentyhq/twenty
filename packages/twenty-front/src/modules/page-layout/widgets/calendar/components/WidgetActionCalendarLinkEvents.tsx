import { LinkCalendarEventsDropdownContent } from '@/activities/calendar/components/LinkCalendarEventsDropdownContent';
import { LinkActivitiesDropdown } from '@/activities/components/LinkActivitiesDropdown';
import { useActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/icon';

export const WidgetActionCalendarLinkEvents = () => {
  const targetRecord = useTargetRecord();
  const activityLinkConfig = useActivityLinkConfig({
    targetRecord,
    activityObjectNameSingular: CoreObjectNameSingular.CalendarEvent,
  });

  if (!isDefined(activityLinkConfig)) {
    return null;
  }

  return (
    <LinkActivitiesDropdown
      dropdownId={`widget-action-calendar-link-events-${targetRecord.id}`}
      ariaLabel={t`Link events`}
      trigger={
        <WidgetCardHeaderActionButton Icon={IconLink} label={t`Link events`} />
      }
    >
      <LinkCalendarEventsDropdownContent
        targetRecord={targetRecord}
        activityLinkConfig={activityLinkConfig}
      />
    </LinkActivitiesDropdown>
  );
};
