import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai-chat/components/AiChatCloseButton';
import { AiChatNewThreadPageActions } from '@/ai-chat/components/AiChatNewThreadPageActions';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';

type AiChatPageHeaderProps = {
  icon: ReactNode;
  actionButton?: ReactNode;
};

export const AiChatPageHeader = ({
  icon,
  actionButton,
}: AiChatPageHeaderProps) => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  return (
    <PageCardHeader
      icon={icon}
      title={t`New chat`}
      actionButton={
        actionButton ??
        (isMobile ? <AiChatCloseButton /> : <AiChatNewThreadPageActions />)
      }
    />
  );
};
