import { EmailsCard } from '@/activities/emails/components/EmailsCard';
import { timelineThreadChannelFilterFamilyState } from '@/activities/emails/states/timelineThreadChannelFilterFamilyState';
import { getTimelineThreadChannelFilterKey } from '@/activities/emails/utils/getTimelineThreadChannelFilterKey';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { WidgetContentShell } from '@/page-layout/widgets/components/WidgetContentShell';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

type MessagesWidgetProps = {
  widget: PageLayoutWidget;
};

export const MessagesWidget = ({ widget: _widget }: MessagesWidgetProps) => {
  const targetRecord = useTargetRecord();
  const timelineThreadChannelFilter = useAtomFamilyStateValue(
    timelineThreadChannelFilterFamilyState,
    targetRecord.id,
  );

  return (
    <WidgetContentShell>
      <EmailsCard
        key={
          isDefined(timelineThreadChannelFilter)
            ? getTimelineThreadChannelFilterKey(timelineThreadChannelFilter)
            : 'all'
        }
      />
    </WidgetContentShell>
  );
};
