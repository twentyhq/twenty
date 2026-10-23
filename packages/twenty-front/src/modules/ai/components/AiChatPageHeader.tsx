import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatNewThreadInboxListToggle } from '@/ai/components/AiChatNewThreadInboxListToggle';
import { AiChatNewThreadPageActions } from '@/ai/components/AiChatNewThreadPageActions';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';

type AiChatPageHeaderProps = {
  actionButton?: ReactNode;
};

export const AiChatPageHeader = ({
  actionButton,
}: AiChatPageHeaderProps = {}) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  return (
    <PageCardHeader
      icon={<AiChatNewThreadInboxListToggle />}
      title={t`New chat`}
      actionButton={
        actionButton ??
        (isMobile ? <AiChatCloseButton /> : <AiChatNewThreadPageActions />)
      }
    />
  );
};
