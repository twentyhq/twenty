import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconButton } from 'twenty-ui/components/input';
import { IconSend, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';

import { useStartAppChannelConversation } from '@/activities/emails/hooks/useStartAppChannelConversation';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { startAppConversationTargetComponentState } from '@/side-panel/pages/start-app-conversation/states/startAppConversationTargetComponentState';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledChannelLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTextarea = styled(TextareaAutosize)`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  outline: none;
  padding: 0;
  resize: none;

  &::placeholder {
    color: ${themeCssVariables.font.color.light};
  }
`;

export const SidePanelStartAppConversationPage = () => {
  const { t } = useLingui();
  const store = useStore();
  const sidePanelPageId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );
  const startAppConversationTarget = useAtomComponentStateValue(
    startAppConversationTargetComponentState,
  );
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { enqueueToast } = useToast();
  const { startAppChannelConversation, loading } =
    useStartAppChannelConversation();
  const [text, setText] = useState('');
  const [idempotencyKey] = useState(() => v4());

  const canSend = isNonEmptyString(text.trim()) && !loading;

  const handleSend = useCallback(async () => {
    if (!isDefined(startAppConversationTarget) || !canSend) {
      return;
    }

    try {
      const messageThreadId = await startAppChannelConversation({
        messageChannelId: startAppConversationTarget.messageChannelId,
        personId: startAppConversationTarget.personId,
        text: text.trim(),
        idempotencyKey,
      });

      const isComposerStillActive =
        store.get(isSidePanelOpenedState.atom) &&
        store.get(sidePanelNavigationStackState.atom).at(-1)?.pageId ===
          sidePanelPageId;

      if (!isComposerStillActive) {
        return;
      }

      if (!isDefined(messageThreadId)) {
        goBackFromSidePanel();

        return;
      }

      openRecordInSidePanel({
        recordId: messageThreadId,
        objectNameSingular: StandardObjectNameSingular.MessageThread,
        resetNavigationStack: true,
      });
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not start the conversation`,
      });
    }
  }, [
    startAppConversationTarget,
    canSend,
    startAppChannelConversation,
    text,
    idempotencyKey,
    store,
    sidePanelPageId,
    goBackFromSidePanel,
    openRecordInSidePanel,
    enqueueToast,
    t,
  ]);

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleSend,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleSend],
  });

  if (!isDefined(startAppConversationTarget)) {
    return null;
  }

  const channelLabel = startAppConversationTarget.channelLabel;

  return (
    <StyledContainer>
      <StyledContent>
        <StyledChannelLabel>{t`Send from ${channelLabel}`}</StyledChannelLabel>
        <StyledTextarea
          aria-label={t`Message`}
          placeholder={t`Write a message`}
          minRows={4}
          value={text}
          disabled={loading}
          onChange={(event) => setText(event.target.value)}
        />
      </StyledContent>
      <SidePanelFooter
        actions={[
          <IconButton
            key="discard"
            size="sm"
            variant="outline"
            aria-label={t`Discard`}
            onClick={goBackFromSidePanel}
          >
            <IconTrash />
          </IconButton>,
          <Button
            key="send"
            size="sm"
            startIcon={<IconSend />}
            shortcut={['Mod', 'Enter']}
            onClick={handleSend}
            disabled={!canSend}
            variant="solid"
            color="accent"
          >{t`Send`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
