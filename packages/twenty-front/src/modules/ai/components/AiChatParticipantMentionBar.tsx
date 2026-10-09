import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { IconUsers } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useAiChatPendingParticipantMentions } from '@/ai/hooks/useAiChatPendingParticipantMentions';

const StyledBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledMessage = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type AiChatParticipantMentionBarProps = {
  editor: Editor | null;
};

export const AiChatParticipantMentionBar = ({
  editor,
}: AiChatParticipantMentionBarProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const pendingParticipantMentions = useAiChatPendingParticipantMentions();

  if (pendingParticipantMentions.length === 0) {
    return null;
  }

  const participantLabels = pendingParticipantMentions
    .map(({ label }) => label)
    .join(', ');
  const message =
    pendingParticipantMentions.length === 1
      ? t`${participantLabels} will be added as a participant and get access to this chat`
      : t`${participantLabels} will be added as participants and get access to this chat`;

  // The mentions stay in the message, only without bringing anyone in
  const handleUndo = () => {
    if (!isDefined(editor)) {
      return;
    }

    const { state } = editor.view;
    const transaction = state.tr;

    state.doc.descendants((node, position) => {
      if (
        node.type.name === TIPTAP_NODE_TYPES.MENTION_TAG &&
        node.attrs.objectNameSingular ===
          CoreObjectNameSingular.WorkspaceMember &&
        node.attrs.shouldAddAsParticipant === true
      ) {
        transaction.setNodeMarkup(position, undefined, {
          ...node.attrs,
          shouldAddAsParticipant: false,
        });
      }
    });

    editor.view.dispatch(transaction);
  };

  return (
    <StyledBar role="status">
      <IconUsers size={theme.icon.size.sm} />
      <StyledMessage title={message}>{message}</StyledMessage>
      <LightButton emphasis="subtle" onClick={handleUndo}>
        {t`Undo`}
      </LightButton>
    </StyledBar>
  );
};
