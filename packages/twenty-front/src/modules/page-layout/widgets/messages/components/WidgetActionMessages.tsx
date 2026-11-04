import { LinkEmailThreadsDropdown } from '@/activities/emails/components/LinkEmailThreadsDropdown';
import { WidgetActionMessageCompose } from '@/page-layout/widgets/messages/components/WidgetActionMessageCompose';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useLingui } from '@lingui/react/macro';
import { IconLink } from 'twenty-ui/icon';

export const WidgetActionMessages = () => {
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
      <WidgetActionMessageCompose />
    </>
  );
};
