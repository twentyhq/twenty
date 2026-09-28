import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { EmailBlockInsertList } from '@/side-panel/pages/email-block-settings/components/EmailBlockInsertList';
import { EmailSidePanelHint } from '@/side-panel/pages/email-block-settings/components/EmailSidePanelHint';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SidePanelEmailDesignPage = () => {
  const { t } = useLingui();
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);

  if (!isDefined(activeEmailEditor) || activeEmailEditor.isDestroyed) {
    return (
      <EmailSidePanelHint>{t`Open an email editor to design it.`}</EmailSidePanelHint>
    );
  }

  return <EmailBlockInsertList editor={activeEmailEditor} />;
};
