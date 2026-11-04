import { useCallRecordingsSeeAllHref } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingsSeeAllHref';
import { useCurrentWidget } from '@/page-layout/widgets/hooks/useCurrentWidget';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { WidgetCardHeaderActionLink } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionLink';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

export const WidgetActionCallRecordingSeeAll = () => {
  const { t } = useLingui();
  const widget = useCurrentWidget();
  const widgetHeaderCount = useAtomComponentFamilyStateValue(
    widgetHeaderCountComponentFamilyState,
    widget.id,
  );
  const callRecordingsSeeAllHref = useCallRecordingsSeeAllHref();

  if (
    !isDefined(callRecordingsSeeAllHref) ||
    !isDefined(widgetHeaderCount) ||
    widgetHeaderCount <= 0
  ) {
    return null;
  }

  return (
    <WidgetCardHeaderActionLink
      Icon={IconArrowUpRight}
      label={t`See all call recordings linked to this calendar event`}
      to={callRecordingsSeeAllHref}
    />
  );
};
