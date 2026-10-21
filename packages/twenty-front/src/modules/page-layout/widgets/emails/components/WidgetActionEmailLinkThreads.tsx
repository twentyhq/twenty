import { LinkEmailThreadsDropdown } from '@/activities/emails/components/LinkEmailThreadsDropdown';
import { useEmailThreadLinkConfig } from '@/activities/emails/hooks/useEmailThreadLinkConfig';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/icon';

export const WidgetActionEmailLinkThreads = () => {
  const targetRecord = useTargetRecord();
  const emailThreadLinkConfig = useEmailThreadLinkConfig(targetRecord);

  if (!isDefined(emailThreadLinkConfig)) {
    return null;
  }

  return (
    <LinkEmailThreadsDropdown
      dropdownId={`widget-action-email-link-threads-${targetRecord.id}`}
      targetRecord={targetRecord}
      emailThreadLinkConfig={emailThreadLinkConfig}
      trigger={
        <WidgetCardHeaderActionButton
          Icon={IconLink}
          label={t`Link email threads`}
        />
      }
    />
  );
};
