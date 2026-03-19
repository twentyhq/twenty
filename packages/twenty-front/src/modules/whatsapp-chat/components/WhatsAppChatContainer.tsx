import styled from '@emotion/styled';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { activeSessionNameState } from '@/whatsapp-chat/states/activeSessionNameState';
import { currentConversationIdState } from '@/whatsapp-chat/states/currentConversationIdState';
import { ChatHeader } from '@/whatsapp-chat/components/ChatHeader';
import { ChatThread } from '@/whatsapp-chat/components/ChatThread';
import { ConversationDetails } from '@/whatsapp-chat/components/ConversationDetails';
import { ConversationList } from '@/whatsapp-chat/components/ConversationList';
import { SessionPicker } from '@/whatsapp-chat/components/SessionPicker';

const LazyFlagLeadModal = lazy(() =>
  import('@/whatsapp-chat/components/FlagLeadModal').then((m) => ({
    default: m.FlagLeadModal,
  })),
);
const LazyForwardMessageModal = lazy(() =>
  import('@/whatsapp-chat/components/ForwardMessageModal').then((m) => ({
    default: m.ForwardMessageModal,
  })),
);
const LazyStrukturanalyseModal = lazy(() =>
  import('@/whatsapp-chat/components/StrukturanalyseModal').then((m) => ({
    default: m.StrukturanalyseModal,
  })),
);
const LazySalesAngelSidePanel = lazy(() =>
  import('@/whatsapp-chat/components/SalesAngelSidePanel').then((m) => ({
    default: m.SalesAngelSidePanel,
  })),
);
import { useLabels } from '@/whatsapp-chat/hooks/useLabels';
import { useMessages } from '@/whatsapp-chat/hooks/useMessages';
import { useSendMessage } from '@/whatsapp-chat/hooks/useSendMessage';
import { useSessions } from '@/whatsapp-chat/hooks/useSessions';
import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import { useWhatsAppWebSocket } from '@/whatsapp-chat/hooks/useWhatsAppWebSocket';
import {
  type WaConversation,
  type WaMessage,
  type WaSession,
  type WsEvent,
} from '@/whatsapp-chat/types/WhatsAppTypes';

const StyledContainer = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const StyledCenterPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`;

const StyledEmptyCenter = styled.div`
  align-items: center;
  background: #EEF0F3;
  color: #6B7280;
  display: flex;
  flex: 1;
  flex-direction: column;
  font-size: 18px;
  font-weight: 500;
  gap: 8px;
  justify-content: center;
`;

const StyledEmptySubtext = styled.span`
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 400;
`;

const StyledConnectionStatus = styled.div<{ connected: boolean }>`
  align-items: center;
  background: ${({ connected }) =>
    connected ? '#F0FDF4' : '#FEF2F2'};
  border-bottom: 1px solid ${({ connected }) =>
    connected ? '#BBF7D0' : '#FECACA'};
  color: ${({ connected }) =>
    connected ? '#166534' : '#DC2626'};
  display: flex;
  font-size: 12px;
  gap: 4px;
  justify-content: center;
  padding: 2px;
`;

const StyledDot = styled.div<{ connected: boolean }>`
  background: ${({ connected }) =>
    connected ? '#22C55E' : '#EF4444'};
  border-radius: 50%;
  height: 6px;
  width: 6px;
`;

const StyledSessionHeader = styled.div`
  align-items: center;
  background: #F0F2F5;
  border-bottom: 1px solid #D1D5DB;
  display: flex;
  gap: 8px;
  padding: 8px 12px;
`;

const StyledBackButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: 6px;
  color: #1A6CFF;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  gap: 4px;
  padding: 4px 8px;

  &:hover {
    background: #E8EBF0;
  }
`;

const StyledSessionName = styled.span`
  color: #374151;
  font-size: 13px;
  font-weight: 600;
`;

export const WhatsAppChatContainer = () => {
  const { bridgeFetch } = useWhatsAppBridge();
  const { sessions, loading: sessionsLoading, error: sessionsError } = useSessions();
  const currentMember = useRecoilValueV2(currentWorkspaceMemberState);
  const currentUserName = currentMember?.name?.firstName
    ? `${currentMember.name.firstName} ${currentMember.name.lastName ?? ''}`.trim()
    : currentMember?.userEmail ?? '';

  const [activeSessionName, setActiveSessionName] = useRecoilStateV2(
    activeSessionNameState,
  );

  // Derive the full session object from the persisted name
  const activeSession = sessions.find((s) => s.name === activeSessionName) ?? null;

  const [currentConversationId, setCurrentConversationId] = useRecoilStateV2(
    currentConversationIdState,
  );

  const [selectedConversation, setSelectedConversation] =
    useState<WaConversation | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<WaMessage | null>(null);
  const [showFlagLead, setShowFlagLead] = useState(false);
  const [saMessage, setSaMessage] = useState<WaMessage | null>(null);
  const saRefreshRef = useRef<(() => void) | null>(null);
  const [showSalesAngel, setShowSalesAngel] = useState(false);
  const [externalDraft, setExternalDraft] = useState<string | null>(null);

  const handleSelectSession = useCallback((session: WaSession) => {
    setActiveSessionName(session.name);
    setCurrentConversationId(null);
    setSelectedConversation(null);
  }, [setActiveSessionName, setCurrentConversationId]);

  const handleBackToSessions = useCallback(() => {
    setActiveSessionName(null);
    setCurrentConversationId(null);
    setSelectedConversation(null);
  }, [setActiveSessionName, setCurrentConversationId]);

  // Auto-select if there's only one session
  useEffect(() => {
    if (!activeSessionName && !sessionsLoading && sessions.length === 1) {
      setActiveSessionName(sessions[0].name);
    }
  }, [activeSessionName, sessionsLoading, sessions, setActiveSessionName]);

  const conversationsRef = useRef<WaConversation[]>([]);

  const { labels, addLabel, removeLabel } = useLabels(currentConversationId);

  const {
    messages,
    loading: messagesLoading,
    hasMore,
    loadOlder,
    addMessage,
    addOptimisticMessage,
    updateMessageByTempId,
    updateMessageById,
    updateMessageByWahaId,
  } = useMessages({ conversationId: currentConversationId });

  const handleWebSocketEvent = useCallback(
    (event: WsEvent) => {
      switch (event.type) {
        case 'message.new': {
          const msgData = event.data as unknown as WaMessage;

          if (
            msgData.conversationId === currentConversationId ||
            event.conversation_id === currentConversationId
          ) {
            addMessage(msgData);
          }

          break;
        }

        case 'message.status': {
          const {
            id,
            status,
            temp_id: tempId,
            waha_id: wahaId,
          } = event.data as {
            id?: string;
            status?: WaMessage['status'];
            temp_id?: string;
            waha_id?: string;
          };

          if (status) {
            if (tempId) {
              updateMessageByTempId(tempId, {
                status,
                id: id ?? undefined,
                wahaId: wahaId ?? undefined,
              });
            }

            if (id) {
              updateMessageById(id, { status });
            }
          }

          break;
        }

        case 'message.edited': {
          const {
            id,
            waha_id: wahaId,
            new_body: newBody,
          } = event.data as {
            id?: string;
            waha_id?: string;
            new_body?: string;
          };

          if (newBody !== undefined) {
            if (id) {
              updateMessageById(id, { body: newBody, isEdited: true });
            } else if (wahaId) {
              updateMessageByWahaId(wahaId, { body: newBody, isEdited: true });
            }
          }

          break;
        }

        case 'message.deleted': {
          const { id, waha_id: wahaId } = event.data as {
            id?: string;
            waha_id?: string;
          };

          if (id) {
            updateMessageById(id, { isDeleted: true });
          } else if (wahaId) {
            updateMessageByWahaId(wahaId, { isDeleted: true });
          }

          break;
        }

        case 'strukturanalyse.complete': {
          // Refresh SA results in ConversationDetails panel
          saRefreshRef.current?.();
          break;
        }

        default:
          break;
      }
    },
    [
      currentConversationId,
      addMessage,
      updateMessageByTempId,
      updateMessageById,
      updateMessageByWahaId,
    ],
  );

  const {
    connected,
    subscribeConversation,
    unsubscribeConversation,
  } = useWhatsAppWebSocket({
    onEvent: handleWebSocketEvent,
  });

  // Subscribe to conversation WebSocket channel when it changes
  useEffect(() => {
    if (!currentConversationId) return;

    subscribeConversation(currentConversationId);

    return () => {
      unsubscribeConversation(currentConversationId);
    };
  }, [currentConversationId, subscribeConversation, unsubscribeConversation]);

  const handleSendError = useCallback(
    (tempId: string) => {
      updateMessageByTempId(tempId, { status: 'FAILED' });
    },
    [updateMessageByTempId],
  );

  const { sendTextMessage, sendMediaMessage } = useSendMessage({
    onOptimisticMessage: addOptimisticMessage,
    onError: handleSendError,
  });

  const handleSelectConversation = useCallback(
    (conversation: WaConversation) => {
      setCurrentConversationId(conversation.id);
      setSelectedConversation(conversation);
    },
    [setCurrentConversationId],
  );

  const handleSendText = useCallback(
    (body: string) => {
      if (!selectedConversation) return;

      sendTextMessage({
        conversationId: selectedConversation.id,
        sessionName: selectedConversation.sessionName,
        toJid: selectedConversation.leadPhoneNumber,
        body,
      });
    },
    [selectedConversation, sendTextMessage],
  );

  const handleSendMedia = useCallback(
    async (file: File) => {
      if (!selectedConversation) return;

      // Create a blob URL for immediate display in the chat
      const blobUrl = URL.createObjectURL(file);

      const reader = new FileReader();

      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const type = file.type.startsWith('audio/') ? 'voice' : 'image';

        sendMediaMessage({
          conversationId: selectedConversation.id,
          sessionName: selectedConversation.sessionName,
          toJid: selectedConversation.leadPhoneNumber,
          type: type as 'image' | 'voice',
          mediaBase64: base64,
          mediaMimetype: file.type,
          body: file.name,
          mediaUrl: blobUrl,
        });
      };

      reader.readAsDataURL(file);
    },
    [selectedConversation, sendMediaMessage],
  );

  const handleTogglePin = useCallback(
    async (id: string, isPinned: boolean) => {
      try {
        await bridgeFetch(`/api/v1/conversations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_pinned: isPinned }),
        });

        if (selectedConversation?.id === id) {
          setSelectedConversation((prev) =>
            prev ? { ...prev, isPinned } : null,
          );
        }
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, selectedConversation],
  );

  const handleArchive = useCallback(
    async (id: string) => {
      try {
        await bridgeFetch(`/api/v1/conversations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_archived: true }),
        });

        if (currentConversationId === id) {
          setCurrentConversationId(null);
          setSelectedConversation(null);
        }
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, currentConversationId, setCurrentConversationId],
  );

  const handleToggleRead = useCallback(
    async (id: string, isUnread: boolean) => {
      try {
        await bridgeFetch(`/api/v1/conversations/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_unread: isUnread }),
        });
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch],
  );

  const handleEditMessage = useCallback(
    async (messageId: string, newBody: string) => {
      try {
        await bridgeFetch(`/api/v1/messages/${messageId}/edit`, {
          method: 'POST',
          body: JSON.stringify({ new_body: newBody }),
        });
        updateMessageById(messageId, { body: newBody, isEdited: true });
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, updateMessageById],
  );

  const handleDeleteMessage = useCallback(
    async (message: WaMessage) => {
      try {
        await bridgeFetch(`/api/v1/messages/${message.id}/delete`, {
          method: 'POST',
        });
        updateMessageById(message.id, { isDeleted: true });
      } catch {
        // Silently fail
      }
    },
    [bridgeFetch, updateMessageById],
  );

  const handleConversationUpdate = useCallback(
    (id: string, updates: Partial<WaConversation>) => {
      if (selectedConversation?.id === id) {
        setSelectedConversation((prev) =>
          prev ? { ...prev, ...updates } : null,
        );
      }
    },
    [selectedConversation],
  );

  const handleForwardSend = useCallback(
    (targetConversationId: string, text: string) => {
      const target = conversationsRef.current.find(
        (c) => c.id === targetConversationId,
      );
      if (!target) return;

      sendTextMessage({
        conversationId: target.id,
        sessionName: target.sessionName,
        toJid: target.leadPhoneNumber,
        body: text,
      });
      setForwardingMessage(null);
    },
    [sendTextMessage],
  );

  const handleForwardMessage = useCallback((message: WaMessage) => {
    setForwardingMessage(message);
  }, []);

  const handleFlagLead = useCallback(() => {
    setShowFlagLead(true);
  }, []);

  const handleStrukturanalyse = useCallback((message: WaMessage) => {
    setSaMessage(message);
  }, []);

  if (!activeSession) {
    return (
      <SessionPicker
        sessions={sessions}
        loading={sessionsLoading}
        error={sessionsError}
        onSelectSession={handleSelectSession}
      />
    );
  }

  const activeSessionArray = [activeSession];

  return (
    <StyledContainer>
      <ConversationList
        sessions={activeSessionArray}
        selectedConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onConversationsLoaded={(convs) => {
          conversationsRef.current = convs;
        }}
        onTogglePin={handleTogglePin}
        onArchive={handleArchive}
        onToggleRead={handleToggleRead}
        sessionHeader={
          <StyledSessionHeader>
            <StyledBackButton onClick={handleBackToSessions}>
              ← Sessions
            </StyledBackButton>
            <StyledSessionName>
              {activeSession.me?.pushName || activeSession.name}
            </StyledSessionName>
          </StyledSessionHeader>
        }
      />

      <StyledCenterPanel>
        {!connected && (
          <StyledConnectionStatus connected={false}>
            <StyledDot connected={false} />
            Reconnecting to WhatsApp bridge...
          </StyledConnectionStatus>
        )}

        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              labels={labels}
              onAddLabel={addLabel}
              onRemoveLabel={removeLabel}
              onTogglePin={handleTogglePin}
              onArchive={handleArchive}
              onToggleDetails={() => setShowDetails((prev) => !prev)}
              onToggleSalesAngel={() => setShowSalesAngel((prev) => !prev)}
              showSalesAngel={showSalesAngel}
            />
            <ChatThread
              conversation={selectedConversation}
              messages={messages}
              loading={messagesLoading}
              hasMore={hasMore}
              onLoadOlder={loadOlder}
              onSendText={handleSendText}
              onSendMedia={handleSendMedia}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onForwardMessage={handleForwardMessage}
              onFlagLead={handleFlagLead}
              onStrukturanalyse={handleStrukturanalyse}
              externalDraft={externalDraft}
              onExternalDraftConsumed={() => setExternalDraft(null)}
            />
          </>
        ) : (
          <StyledEmptyCenter>
            WhatsApp Chat
            <StyledEmptySubtext>
              Select a conversation to start messaging
            </StyledEmptySubtext>
          </StyledEmptyCenter>
        )}
      </StyledCenterPanel>

      {showDetails && selectedConversation && (
        <ConversationDetails
          conversation={selectedConversation}
          onClose={() => setShowDetails(false)}
          onUpdate={handleConversationUpdate}
          saRefreshRef={saRefreshRef}
        />
      )}

      {showSalesAngel && selectedConversation && (
        <Suspense fallback={null}>
          <LazySalesAngelSidePanel
            conversationId={selectedConversation.id}
            phoneNumber={selectedConversation.leadPhoneNumber}
            onClose={() => setShowSalesAngel(false)}
            onCopyToChat={(message) => setExternalDraft(message)}
          />
        </Suspense>
      )}

      {forwardingMessage && selectedConversation && (
        <Suspense fallback={null}>
          <LazyForwardMessageModal
            message={forwardingMessage}
            sourceConversation={selectedConversation}
            conversations={conversationsRef.current}
            currentUserName={currentUserName}
            onClose={() => setForwardingMessage(null)}
            onSend={handleForwardSend}
          />
        </Suspense>
      )}

      {showFlagLead && selectedConversation && (
        <Suspense fallback={null}>
          <LazyFlagLeadModal
            conversation={selectedConversation}
            currentUserName={currentUserName}
            onClose={() => setShowFlagLead(false)}
            onFlagged={() => setShowFlagLead(false)}
          />
        </Suspense>
      )}

      {saMessage && selectedConversation && (
        <Suspense fallback={null}>
          <LazyStrukturanalyseModal
            message={saMessage}
            conversation={selectedConversation}
            onClose={() => setSaMessage(null)}
          />
        </Suspense>
      )}
    </StyledContainer>
  );
};
