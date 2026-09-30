import { useLingui } from '@lingui/react/macro';
import { isDefined, isValidUuid } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { AiChatPageThreadHeader } from '@/ai/components/AiChatPageThreadHeader';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatPageHeader = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  if (isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)) {
    return (
      <AiChatPageThreadHeader
        key={currentAiChatThread}
        threadId={currentAiChatThread}
      />
    );
  }

  return (
    <PageCardHeader
      title={t`New chat`}
      actionButton={isMobile ? <AiChatCloseButton /> : undefined}
    />
  );
};
