import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { InboxCloseButton } from '@/ai/components/InboxCloseButton';
import { InboxNewThreadInboxListToggle } from '@/ai/components/InboxNewThreadInboxListToggle';
import { InboxNewThreadPageActions } from '@/ai/components/InboxNewThreadPageActions';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';

type InboxThreadPageHeaderProps = {
  actionButton?: ReactNode;
};

export const InboxThreadPageHeader = ({
  actionButton,
}: InboxThreadPageHeaderProps = {}) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  return (
    <PageCardHeader
      icon={<InboxNewThreadInboxListToggle />}
      title={t`New chat`}
      actionButton={
        actionButton ??
        (isMobile ? <InboxCloseButton /> : <InboxNewThreadPageActions />)
      }
    />
  );
};
