import { useLingui } from '@lingui/react/macro';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';

export const AiChatPageHeader = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  return (
    <PageCardHeader
      title={t`New chat`}
      actionButton={isMobile ? <AiChatCloseButton /> : undefined}
    />
  );
};
