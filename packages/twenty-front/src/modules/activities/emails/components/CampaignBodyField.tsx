import { styled } from '@linaria/react';

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
};

export const CampaignBodyField = ({ campaign }: CampaignBodyFieldProps) => {
  const { body, setBody, flush, draftResyncKey } = useCampaignBodyState({
    campaign,
  });
  const setActiveEmailEditor = useSetAtomState(activeEmailEditorState);
  const { uploadEmailImage } = useUploadEmailImage();

  return (
    <StyledContainer onBlur={() => flush()}>
      <FormAdvancedTextFieldInput
        key={draftResyncKey}
        defaultValue={body}
        onChange={setBody}
        profile={CAMPAIGN_BODY_EDITOR_PROFILE}
        EditorComponent={EmailEditorCanvas}
        onEditorReady={setActiveEmailEditor}
        onImageUpload={uploadEmailImage}
      />
    </StyledContainer>
  );
};
