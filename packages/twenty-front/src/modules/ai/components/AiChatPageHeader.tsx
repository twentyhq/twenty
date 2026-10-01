import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { AiChatCloseButton } from '@/ai/components/AiChatCloseButton';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadDataSelector } from '@/ai/states/selectors/currentAiChatThreadDataSelector';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AiChatPageHeader = () => {
  const { t } = useLingui();
  const isMobile = useIsMobile();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const currentAiChatThreadData = useAtomStateValue(
    currentAiChatThreadDataSelector,
  );

  return (
    <PageCardHeader
      title={
        isDefined(currentAiChatThread)
          ? (currentAiChatThreadData?.title ?? t`Chat`)
          : t`New chat`
      }
      actionButton={isMobile ? <AiChatCloseButton /> : undefined}
    />
  );
};
