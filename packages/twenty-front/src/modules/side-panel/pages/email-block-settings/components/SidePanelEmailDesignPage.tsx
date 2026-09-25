import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Editor } from '@tiptap/core';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { getBlockSelectionTarget } from '@/advanced-text-editor/utils/getBlockSelectionTarget';
import { useOpenEmailBlockStyleInSidePanel } from '@/side-panel/hooks/useOpenEmailBlockStyleInSidePanel';
import { EmailBlockInsertList } from '@/side-panel/pages/email-block-settings/components/EmailBlockInsertList';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

const EmailDesignContent = ({ editor }: { editor: Editor }) => {
  const { openEmailBlockStyleInSidePanel } =
    useOpenEmailBlockStyleInSidePanel();

  useEffect(() => {
    const editorElement = editor.view.dom;
    const handleEditorClick = () => {
      if (isDefined(getBlockSelectionTarget(editor))) {
        openEmailBlockStyleInSidePanel();
      }
    };

    editorElement.addEventListener('click', handleEditorClick);

    return () => {
      editorElement.removeEventListener('click', handleEditorClick);
    };
  }, [editor, openEmailBlockStyleInSidePanel]);

  return <EmailBlockInsertList editor={editor} />;
};

export const SidePanelEmailDesignPage = () => {
  const { t } = useLingui();
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);

  if (!isDefined(activeEmailEditor) || activeEmailEditor.isDestroyed) {
    return <StyledHint>{t`Open an email editor to design it.`}</StyledHint>;
  }

  return <EmailDesignContent editor={activeEmailEditor} />;
};
