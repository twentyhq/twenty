import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai-chat/components/AiChatCloseButton';
import { AiChatNewThreadPageActions } from '@/ai-chat/instance/components/AiChatNewThreadPageActions';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';

type AiChatNewThreadPageHeaderProps = {
  icon: ReactNode;
  actionButton?: ReactNode;
};

export const AiChatNewThreadPageHeader = ({
  icon,
  actionButton,
}: AiChatNewThreadPageHeaderProps) => {
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
