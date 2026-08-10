import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useState } from 'react';
import {
  CANVAS_THEME_DEFAULTS,
  isDefined,
  resolveCanvasTheme,
} from 'twenty-shared/utils';

import { CampaignSentEnvelope } from '@/activities/emails/components/CampaignSentEnvelope';
import { EmailEditorCanvas } from '@/activities/emails/editor/components/EmailEditorCanvas';
import { CAMPAIGN_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/CampaignBodyEditorProfile';
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

  // Same column as the draft composer: the envelope follows the page width the
  // campaign was designed at rather than assuming the default.
  const canvasWidth = useEditorState({
    editor: bodyEditor,
    selector: ({ editor }) =>
      isDefined(editor)
        ? (resolveCanvasTheme(editor.state.doc.attrs.canvasTheme)?.width ??
          CANVAS_THEME_DEFAULTS.width)
        : CANVAS_THEME_DEFAULTS.width,
  });

  return (
    <StyledContainer>
      <CampaignSentEnvelope
        campaign={campaign}
        width={canvasWidth ?? CANVAS_THEME_DEFAULTS.width}
      />
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
