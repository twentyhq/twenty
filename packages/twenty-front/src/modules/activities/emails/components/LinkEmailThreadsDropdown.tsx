import { LinkEmailThreadsDropdownContent } from '@/activities/emails/components/LinkEmailThreadsDropdownContent';
import { type EmailThreadLinkConfig } from '@/activities/emails/hooks/useEmailThreadLinkConfig';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';

const LINK_EMAIL_THREADS_DROPDOWN_WIDTH_PX = 320;

type LinkEmailThreadsDropdownProps = {
  dropdownId: string;
  targetRecord: ActivityTargetableObject;
  emailThreadLinkConfig: EmailThreadLinkConfig;
  trigger: ReactElement;
};

export const LinkEmailThreadsDropdown = ({
  dropdownId,
  targetRecord,
  emailThreadLinkConfig,
  trigger,
}: LinkEmailThreadsDropdownProps) => {
  const { t } = useLingui();

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker" multiple>
      <Dropdown.Trigger render={trigger} />
      <DropdownContent
        width={LINK_EMAIL_THREADS_DROPDOWN_WIDTH_PX}
        align="end"
        aria-label={t`Link email threads`}
      >
        <LinkEmailThreadsDropdownContent
          targetRecord={targetRecord}
          emailThreadLinkConfig={emailThreadLinkConfig}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
