import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useCampaignBodyState } from '@/activities/emails/hooks/useCampaignBodyState';
import { useCampaignEmailEditorVariables } from '@/activities/emails/hooks/useCampaignEmailEditorVariables';
import { InsertRail } from '@/advanced-text-editor/components/InsertRail';
import { useUploadEmailImage } from '@/advanced-text-editor/hooks/useUploadEmailImage';
import { activeEmailEditorState } from '@/advanced-text-editor/states/activeEmailEditorState';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

type CampaignBodyFieldProps = {
  campaign: MessageCampaign;
};

export const CampaignBodyField = ({ campaign }: CampaignBodyFieldProps) => {
  const { body, setBody, flush } = useCampaignBodyState({ campaign });
  const setActiveEmailEditor = useSetAtomState(activeEmailEditorState);
  const { uploadEmailImage } = useUploadEmailImage();
  const { variables } = useCampaignEmailEditorVariables();

  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);

  const handleEditorReady = useCallback(
    (editor: Editor | null) => {
      setActiveEmailEditor(editor);
      setBodyEditor(editor);
    },
    [setActiveEmailEditor],
  );

  return (
    <StyledContainer onBlur={() => flush()}>
      <FormAdvancedTextFieldInput
        defaultValue={body}
        onChange={setBody}
        placeholder={t`Type something or press "/" to see commands`}
        preset="campaignBody"
        onEditorReady={handleEditorReady}
        onImageUpload={uploadEmailImage}
      />
      {isDefined(bodyEditor) && (
        <InsertRail
          editor={bodyEditor}
          onImageUpload={uploadEmailImage}
          variables={variables}
        />
      )}
    </StyledContainer>
  );
};
