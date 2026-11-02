import { styled } from '@linaria/react';
import { useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { AiChatApprovalEmailReview } from '@/ai/components/AiChatApprovalEmailReview';
import { AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES } from '@/ai/components/__stories__/aiChatApprovalEmailReviewFixtures';

const REPLACEMENT_BODY = serializeJsonContentAsAdvancedTextEditorDocument({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'This replacement comes from the caller.' },
      ],
    },
  ],
});

const StyledExample = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

const StyledControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

export const AiChatApprovalEmailControlledExample = () => {
  const [draft, setDraft] = useState(() =>
    structuredClone(AI_CHAT_APPROVAL_EMAIL_REVIEW_FIXTURES[0].draft),
  );
  const [disabled, setDisabled] = useState(false);

  return (
    <StyledExample>
      <AiChatApprovalEmailReview
        draft={draft}
        disabled={disabled}
        onDraftChange={setDraft}
      />
      <StyledControls>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setDraft((currentDraft) => ({
              ...currentDraft,
              subject: 'Replacement from the caller',
              body: REPLACEMENT_BODY,
            }))
          }
        >
          Replace draft
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDisabled((currentDisabled) => !currentDisabled)}
        >
          {disabled ? 'Unlock review' : 'Lock review'}
        </Button>
      </StyledControls>
    </StyledExample>
  );
};
