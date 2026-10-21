import { LinkActivitiesDropdown } from '@/activities/components/LinkActivitiesDropdown';
import { LinkEmailThreadsDropdownContent } from '@/activities/emails/components/LinkEmailThreadsDropdownContent';
import { useActivityLinkConfig } from '@/activities/hooks/useActivityLinkConfig';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/icon';

export const WidgetActionEmailLinkThreads = () => {
  const targetRecord = useTargetRecord();
  const activityLinkConfig = useActivityLinkConfig({
    targetRecord,
    activityObjectNameSingular: CoreObjectNameSingular.MessageThread,
  });

  if (!isDefined(activityLinkConfig)) {
    return null;
  }

  return (
    <LinkActivitiesDropdown
      dropdownId={`widget-action-email-link-threads-${targetRecord.id}`}
      ariaLabel={t`Link email threads`}
      trigger={
        <WidgetCardHeaderActionButton
          Icon={IconLink}
          label={t`Link email threads`}
        />
      }
    >
      <LinkEmailThreadsDropdownContent
        targetRecord={targetRecord}
        activityLinkConfig={activityLinkConfig}
      />
    </LinkActivitiesDropdown>
  );
};
