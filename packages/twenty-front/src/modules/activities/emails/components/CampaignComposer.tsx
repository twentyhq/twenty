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

// One widget, not two: stacked widgets would each get boxed in their own card.
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
