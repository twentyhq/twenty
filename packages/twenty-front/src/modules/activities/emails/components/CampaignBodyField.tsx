import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useCampaignBodyState } from '@/activities/emails/hooks/useCampaignBodyState';
import { useCampaignEmailEditorVariables } from '@/activities/emails/hooks/useCampaignEmailEditorVariables';
import { EmailEditorCanvas } from '@/activities/emails/editor/components/EmailEditorCanvas';
import { CAMPAIGN_BODY_EDITOR_PROFILE } from '@/activities/emails/editor/constants/CampaignBodyEditorProfile';
import { useUploadEmailImage } from '@/activities/emails/hooks/useUploadEmailImage';
import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/advanced-text-editor/components/FormAdvancedTextFieldInput';
import { AdvancedTextEditorInsertRail } from '@/advanced-text-editor/components/AdvancedTextEditorInsertRail';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  position: relative;
`;

type CampaignBodyFieldProps = {
  campaign: MessageCampaign;
  // Lets the composer follow the canvas: its width is a per-campaign design
  // setting, and the envelope block above lines up with it.
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
  const { variables } = useCampaignEmailEditorVariables();

  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);

  const handleEditorReady = useCallback(
    (editor: Editor | null) => {
      setActiveEmailEditor(editor);
      setBodyEditor(editor);
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
      {isDefined(bodyEditor) && (
        <AdvancedTextEditorInsertRail
          editor={bodyEditor}
          onImageUpload={uploadEmailImage}
          variables={variables}
        />
      )}
    </StyledContainer>
  );
};
