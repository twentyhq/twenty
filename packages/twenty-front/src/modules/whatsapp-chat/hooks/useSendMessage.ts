import { useCallback } from 'react';

import { useWhatsAppBridge } from '@/whatsapp-chat/hooks/useWhatsAppBridge';
import {
  type SendMessagePayload,
  type WaMessage,
} from '@/whatsapp-chat/types/WhatsAppTypes';

interface UseSendMessageOptions {
  onOptimisticMessage: (message: WaMessage) => void;
  onError?: (tempId: string) => void;
}

export const useSendMessage = ({
  onOptimisticMessage,
  onError,
}: UseSendMessageOptions) => {
  const { bridgeFetch } = useWhatsAppBridge();

  const sendTextMessage = useCallback(
    async ({
      conversationId,
      sessionName,
      toJid,
      body,
    }: {
      conversationId: string;
      sessionName: string;
      toJid: string;
      body: string;
    }) => {
      const tempId = crypto.randomUUID();

      const optimisticMessage: WaMessage = {
        id: tempId,
        wahaId: '',
        conversationId,
        sessionName,
        fromAgent: true,
        body,
        messageTimestamp: new Date().toISOString(),
        status: 'SENDING',
        hasMedia: false,
        source: 'APP',
        tempId,
      };

      onOptimisticMessage(optimisticMessage);

      try {
        const payload: SendMessagePayload = {
          conversation_id: conversationId,
          session_name: sessionName,
          to_jid: toJid,
          type: 'text',
          body,
          temp_id: tempId,
        };

        await bridgeFetch<WaMessage>('/api/v1/messages/send', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        onError?.(tempId);
      }
    },
    [bridgeFetch, onOptimisticMessage, onError],
  );

  const sendMediaMessage = useCallback(
    async ({
      conversationId,
      sessionName,
      toJid,
      type,
      mediaBase64,
      mediaMimetype,
      body,
      mediaUrl,
    }: {
      conversationId: string;
      sessionName: string;
      toJid: string;
      type: 'image' | 'voice';
      mediaBase64: string;
      mediaMimetype: string;
      body?: string;
      mediaUrl?: string;
    }) => {
      const tempId = crypto.randomUUID();

      const optimisticMessage: WaMessage = {
        id: tempId,
        wahaId: '',
        conversationId,
        sessionName,
        fromAgent: true,
        body: body ?? null,
        messageTimestamp: new Date().toISOString(),
        status: 'SENDING',
        hasMedia: true,
        mediaMimetype,
        mediaUrl,
        source: 'APP',
        tempId,
      };

      onOptimisticMessage(optimisticMessage);

      try {
        const payload: SendMessagePayload = {
          conversation_id: conversationId,
          session_name: sessionName,
          to_jid: toJid,
          type,
          body,
          media_base64: mediaBase64,
          media_mimetype: mediaMimetype,
          temp_id: tempId,
        };

        await bridgeFetch<WaMessage>('/api/v1/messages/send', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        onError?.(tempId);
      }
    },
    [bridgeFetch, onOptimisticMessage, onError],
  );

  return { sendTextMessage, sendMediaMessage };
};
