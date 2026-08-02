import { styled } from '@linaria/react';
import { useState } from 'react';

import { MassEmailComposeCard } from '@/activities/emails/mass-email/components/MassEmailComposeCard';
import { MassEmailRecipientList } from '@/activities/emails/mass-email/components/MassEmailRecipientList';
import { useMassEmailComposerState } from '@/activities/emails/mass-email/hooks/useMassEmailComposerState';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

type MassEmailWorkspaceProps = {
  connectedAccountId: string;
  personIds: string[];
  initialDraft?: {
    campaignId: string;
    subject: string;
    body: string;
  };
  onSent: () => void;
};

export const MassEmailWorkspace = ({
  connectedAccountId,
  personIds,
  initialDraft,
  onSent,
}: MassEmailWorkspaceProps) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  const composerState = useMassEmailComposerState({
    connectedAccountId,
    personIds,
    initialDraft,
    onSent,
  });

  return (
    <StyledContainer>
      <MassEmailRecipientList
        composerState={composerState}
        selectedPersonId={selectedPersonId}
        onSelect={setSelectedPersonId}
      />
      <MassEmailComposeCard
        composerState={composerState}
        selectedPersonId={selectedPersonId}
      />
    </StyledContainer>
  );
};
