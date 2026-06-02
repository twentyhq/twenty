import { useCallback, useState } from 'react';

import { useSendMessageBroadcast } from '@/activities/emails/hooks/useSendMessageBroadcast';

type UseCampaignComposerStateArgs = {
  defaultSubject?: string;
  onSent?: () => void;
};

export const useCampaignComposerState = ({
  defaultSubject = '',
  onSent,
}: UseCampaignComposerStateArgs) => {
  const [messageTopicId, setMessageTopicId] = useState<string | null>(null);
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [fromAddress, setFromAddress] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');

  const { sendMessageBroadcast, loading } = useSendMessageBroadcast();

  const canSend =
    messageTopicId !== null &&
    fromAddress.trim().length > 0 &&
    subject.trim().length > 0 &&
    !loading;

  const handleSend = useCallback(async () => {
    if (
      messageTopicId === null ||
      fromAddress.trim().length === 0 ||
      subject.trim().length === 0
    ) {
      return;
    }

    const success = await sendMessageBroadcast({
      messageTopicId,
      segmentId: segmentId ?? undefined,
      subject,
      body,
      fromAddress: fromAddress.trim(),
    });

    if (success) {
      onSent?.();
    }
  }, [
    messageTopicId,
    segmentId,
    fromAddress,
    subject,
    body,
    sendMessageBroadcast,
    onSent,
  ]);

  return {
    messageTopicId,
    setMessageTopicId,
    segmentId,
    setSegmentId,
    fromAddress,
    setFromAddress,
    subject,
    setSubject,
    body,
    setBody,
    handleSend,
    canSend,
    loading,
  };
};
