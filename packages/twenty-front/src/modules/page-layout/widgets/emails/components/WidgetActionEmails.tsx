import { LinkEmailThreadsDropdown } from '@/activities/emails/components/LinkEmailThreadsDropdown';
import { WidgetActionEmailCompose } from '@/page-layout/widgets/emails/components/WidgetActionEmailCompose';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useLingui } from '@lingui/react/macro';
import { IconLink } from 'twenty-ui/icon';

export const WidgetActionEmails = () => {
  const { t } = useLingui();

  return (
    <>
      <LinkEmailThreadsDropdown
        dropdownIdPrefix="widget-action-email-link-threads"
        trigger={
          <WidgetCardHeaderActionButton
            Icon={IconLink}
            label={t`Link email threads`}
          />
        }
      />
      <WidgetActionEmailCompose />
    </>
  );
};
