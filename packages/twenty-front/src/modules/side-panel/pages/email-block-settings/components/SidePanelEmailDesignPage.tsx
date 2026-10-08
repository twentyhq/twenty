import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { EmailBlockInsertList } from '@/side-panel/pages/email-block-settings/components/EmailBlockInsertList';
import { StyledEmailSidePanelHint } from '@/side-panel/pages/email-block-settings/components/StyledEmailSidePanelHint';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SidePanelEmailDesignPage = () => {
  const { t } = useLingui();
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);

  if (!isDefined(activeEmailEditor) || activeEmailEditor.isDestroyed) {
    return (
      <StyledEmailSidePanelHint>{t`Open an email editor to design it.`}</StyledEmailSidePanelHint>
    );
  }

  return <EmailBlockInsertList editor={activeEmailEditor} />;
};
