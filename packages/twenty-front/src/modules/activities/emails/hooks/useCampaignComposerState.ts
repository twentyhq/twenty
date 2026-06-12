import { useState } from 'react';

import { useSendMessageCampaign } from '@/activities/emails/hooks/useSendMessageCampaign';

type UseCampaignComposerStateArgs = {
  onSent?: () => void;
};

export const useCampaignComposerState = ({
  onSent,
}: UseCampaignComposerStateArgs) => {
  const [messageTopicId, setMessageTopicId] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>(null);
  const [fromAddress, setFromAddress] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const { sendMessageCampaign, loading } = useSendMessageCampaign();

  const canSend =
    listId !== null &&
    fromAddress.trim().length > 0 &&
    subject.trim().length > 0 &&
    !loading;

  const handleSend = async () => {
    if (listId === null || !canSend) {
      return;
    }

    const success = await sendMessageCampaign({
      listId,
      messageTopicId: messageTopicId ?? undefined,
      subject,
      body,
      fromAddress: fromAddress.trim(),
    });

    if (success) {
      onSent?.();
    }
  };

  return {
    messageTopicId,
    setMessageTopicId,
    listId,
    setListId,
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
