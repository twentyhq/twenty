import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { EmailBlockInsertList } from '@/side-panel/pages/email-block-settings/components/EmailBlockInsertList';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

export const SidePanelEmailDesignPage = () => {
  const { t } = useLingui();
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);

  if (!isDefined(activeEmailEditor) || activeEmailEditor.isDestroyed) {
    return <StyledHint>{t`Open an email editor to design it.`}</StyledHint>;
  }

  return <EmailBlockInsertList editor={activeEmailEditor} />;
};
