import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useCallback } from 'react';

import { useCampaignBodyState } from '@/activities/emails/hooks/useCampaignBodyState';
import { EmailEditorCanvas } from '@/activities/emails/editor/components/EmailEditorCanvas';
import { CAMPAIGN_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/CampaignBodyEditorProfile';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

type CampaignBodyFieldProps = {
  campaign: MessageCampaign;
  // Exposes the editor so the envelope block can follow the per-campaign canvas width.
  onEditorReady?: (editor: Editor | null) => void;
};

export const CampaignBodyField = ({
  campaign,
  onEditorReady,
}: CampaignBodyFieldProps) => {
  const { body, setBody, flush, draftResyncKey } = useCampaignBodyState({
    campaign,
  });
  const setActiveEmailEditor = useSetAtomState(activeEmailEditorState);
  const { uploadEmailImage } = useUploadEmailImage();

  const handleEditorReady = useCallback(
    (editor: Editor | null) => {
      setActiveEmailEditor(editor);
      onEditorReady?.(editor);
    },
    [setActiveEmailEditor, onEditorReady],
  );

  return (
    <StyledContainer onBlur={() => flush()}>
      <FormAdvancedTextFieldInput
        key={draftResyncKey}
        defaultValue={body}
        onChange={setBody}
        placeholder={t`Type something or press "/" to see commands`}
        profile={CAMPAIGN_BODY_EDITOR_PROFILE}
        EditorComponent={EmailEditorCanvas}
        onEditorReady={handleEditorReady}
        onImageUpload={uploadEmailImage}
      />
    </StyledContainer>
  );
};
