import { LinkCalendarEventsDropdown } from '@/activities/calendar/components/LinkCalendarEventsDropdown';
import { WidgetActionCalendarEventCreate } from '@/page-layout/widgets/calendar/components/WidgetActionCalendarEventCreate';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useLingui } from '@lingui/react/macro';
import { IconLink } from 'twenty-ui/icon';

export const WidgetActionCalendar = () => {
  const { t } = useLingui();

  return (
    <>
      <LinkCalendarEventsDropdown
        dropdownIdPrefix="widget-action-calendar-link-events"
        trigger={
          <WidgetCardHeaderActionButton
            Icon={IconLink}
            label={t`Link events`}
          />
        }
      />
      <WidgetActionCalendarEventCreate />
    </>
  );
};
