import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { activeEmailEditorState } from '@/activities/emails/states/activeEmailEditorState';
import { EmailPageStyleSection } from '@/side-panel/pages/email-block-settings/components/EmailPageStyleSection';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[4]};
`;

export const SidePanelEmailPageStylePage = () => {
  const { t } = useLingui();
  const activeEmailEditor = useAtomStateValue(activeEmailEditorState);

  if (!isDefined(activeEmailEditor) || activeEmailEditor.isDestroyed) {
    return (
      <StyledHint>{t`Open an email editor to edit the page style.`}</StyledHint>
    );
  }

  return <EmailPageStyleSection editor={activeEmailEditor} />;
};
