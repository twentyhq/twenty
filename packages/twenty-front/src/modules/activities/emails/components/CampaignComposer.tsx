import { styled } from '@linaria/react';
import { type Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useState } from 'react';
import {
  CANVAS_THEME_DEFAULTS,
  isDefined,
  resolveCanvasTheme,
} from 'twenty-shared/utils';

import { CampaignBodyField } from '@/activities/emails/components/CampaignBodyField';
import { CampaignDetailsFields } from '@/activities/emails/components/CampaignDetailsFields';
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

  // The body renders as a centred page whose width the Design panel owns, so
  // the envelope block reads its width from the document rather than assuming
  // the 600px default.
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
      <CampaignDetailsFields
        campaign={campaign}
        width={canvasWidth ?? CANVAS_THEME_DEFAULTS.width}
      />
      <CampaignBodyField campaign={campaign} onEditorReady={setBodyEditor} />
    </StyledContainer>
  );
};
