import { useId, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { getAgentChatChannelViewKey } from '@/ai/utils/getAgentChatChannelViewKey';
import { getAiChatInboxRecordSelectionScope } from '@/ai/utils/getAiChatInboxRecordSelectionScope';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatInboxRecordSelectionInstanceId = () => {
  const baseInstanceId = useId();
  const { threadId } = useParams();
  const { key: locationKey } = useLocation();
  const [selectionScope, setSelectionScope] = useState(() =>
    getAiChatInboxRecordSelectionScope({ threadId, locationKey }),
  );
  const nextSelectionScope = getAiChatInboxRecordSelectionScope({
    threadId,
    locationKey,
    previousScope: selectionScope,
  });

  if (nextSelectionScope !== selectionScope) {
    setSelectionScope(nextSelectionScope);
  }

  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const shownListKey = isDefined(agentChatShownChannelView)
    ? getAgentChatChannelViewKey(agentChatShownChannelView)
    : agentChatThreadFilterStatus;
  const [shownListScope, setShownListScope] = useState({
    key: shownListKey,
    generation: 0,
  });
  // A selection belongs to the list it was made in, so showing another tab or
  // channel, or coming back to it, starts empty
  const shownListGeneration =
    shownListScope.key === shownListKey
      ? shownListScope.generation
      : shownListScope.generation + 1;

  if (shownListScope.key !== shownListKey) {
    setShownListScope({ key: shownListKey, generation: shownListGeneration });
  }

  return `${baseInstanceId}-${nextSelectionScope.generation}-${shownListGeneration}`;
};
