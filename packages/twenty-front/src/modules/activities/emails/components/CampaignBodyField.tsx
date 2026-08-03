import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Editor } from '@tiptap/core';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconAdjustments } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useCampaignBodyState } from '@/activities/emails/hooks/useCampaignBodyState';
import { useUploadCampaignImage } from '@/activities/emails/hooks/useUploadCampaignImage';
import { InsertRail } from '@/advanced-text-editor/components/InsertRail';
import { campaignBodyEditorState } from '@/activities/emails/states/campaignBodyEditorState';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { useOpenCampaignBlockSettingsInSidePanel } from '@/side-panel/hooks/useOpenCampaignBlockSettingsInSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  position: relative;
`;

const StyledBlockSettingsButtonContainer = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[1]};
  top: ${themeCssVariables.spacing[1]};
  z-index: 1;
`;

type CampaignBodyFieldProps = {
  campaign: MessageCampaign;
};

export const CampaignBodyField = ({ campaign }: CampaignBodyFieldProps) => {
  const { body, setBody, flush } = useCampaignBodyState({ campaign });
  const setCampaignBodyEditor = useSetAtomState(campaignBodyEditorState);
  const { openCampaignBlockSettingsInSidePanel } =
    useOpenCampaignBlockSettingsInSidePanel();

  const { uploadCampaignImage } = useUploadCampaignImage();

  const [bodyEditor, setBodyEditor] = useState<Editor | null>(null);

  const handleEditorReady = useCallback(
    (editor: Editor | null) => {
      setCampaignBodyEditor(editor);
      setBodyEditor(editor);
    },
    [setCampaignBodyEditor],
  );

  return (
    <StyledContainer onBlur={() => flush()}>
      <StyledBlockSettingsButtonContainer>
        <LightIconButton
          Icon={IconAdjustments}
          size="small"
          accent="tertiary"
          title={t`Block settings`}
          onClick={openCampaignBlockSettingsInSidePanel}
        />
      </StyledBlockSettingsButtonContainer>
      <FormAdvancedTextFieldInput
        defaultValue={body}
        onChange={setBody}
        placeholder={t`Type something or press "/" to see commands`}
        preset="campaignBody"
        onEditorReady={handleEditorReady}
        onImageUpload={uploadCampaignImage}
      />
      {isDefined(bodyEditor) && (
        <InsertRail editor={bodyEditor} onImageUpload={uploadCampaignImage} />
      )}
    </StyledContainer>
  );
};
