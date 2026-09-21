import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/core';
import { useState } from 'react';

import { CampaignBodyField } from '@/activities/emails/components/CampaignBodyField';
import { CampaignDetailsFields } from '@/activities/emails/components/CampaignDetailsFields';
import { useCampaignCanvasWidth } from '@/activities/emails/hooks/useCampaignCanvasWidth';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

type CampaignComposerProps = {
  campaign: MessageCampaign;
};

// The envelope fields and the body are one surface rather than two widgets, so
// the composer tab keeps a single full-bleed widget: stacking two widgets would
// box each of them in its own card.
export const CampaignComposer = ({ campaign }: CampaignComposerProps) => {
  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);
  const canvasWidth = useCampaignCanvasWidth(bodyEditor);

  return (
    <StyledContainer>
      <CampaignDetailsFields campaign={campaign} width={canvasWidth} />
      <CampaignBodyField campaign={campaign} onEditorReady={setBodyEditor} />
    </StyledContainer>
  );
};
