import { useCallback, useState } from 'react';

import { useSendEmailCampaign } from '@/activities/emails/hooks/useSendEmailCampaign';

type UseEmailCampaignComposerStateArgs = {
  defaultSubject?: string;
  onSent?: () => void;
};

export const useEmailCampaignComposerState = ({
  defaultSubject = '',
  onSent,
}: UseEmailCampaignComposerStateArgs) => {
  const [emailListId, setEmailListId] = useState<string | null>(null);
  const [fromAddress, setFromAddress] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState('');

  const { sendEmailCampaign, loading } = useSendEmailCampaign();

  const canSend =
    emailListId !== null &&
    fromAddress.trim().length > 0 &&
    subject.trim().length > 0 &&
    !loading;

  const handleSend = useCallback(async () => {
    if (
      emailListId === null ||
      fromAddress.trim().length === 0 ||
      subject.trim().length === 0
    ) {
      return;
    }

    const success = await sendEmailCampaign({
      emailListId,
      subject,
      body,
      fromAddress: fromAddress.trim(),
    });

    if (success) {
      onSent?.();
    }
  }, [emailListId, fromAddress, subject, body, sendEmailCampaign, onSent]);

  return {
    emailListId,
    setEmailListId,
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
