import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useState } from 'react';

import { CampaignSentEnvelope } from '@/activities/emails/components/CampaignSentEnvelope';
import { EmailEditorCanvas } from '@/activities/emails/editor/components/EmailEditorCanvas';
import { CAMPAIGN_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/CampaignBodyEditorProfile';
import { useCampaignCanvasWidth } from '@/activities/emails/hooks/useCampaignCanvasWidth';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
`;

const StyledBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

type CampaignSentPreviewProps = {
  campaign: MessageCampaign;
};

export const CampaignSentPreview = ({ campaign }: CampaignSentPreviewProps) => {
  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);
  const canvasWidth = useCampaignCanvasWidth(bodyEditor);

  return (
    <StyledContainer>
      <CampaignSentEnvelope campaign={campaign} width={canvasWidth} />
      <StyledBody>
        <FormAdvancedTextFieldInput
          defaultValue={campaign.bodyTemplate}
          readonly
          profile={CAMPAIGN_BODY_EDITOR_PROFILE}
          EditorComponent={EmailEditorCanvas}
          placeholder={t`No content`}
          onEditorReady={setBodyEditor}
        />
      </StyledBody>
    </StyledContainer>
  );
};
