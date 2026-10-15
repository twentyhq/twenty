import { type Shortcut as ShortcutMenuEntry } from '@/keyboard-shortcut-menu/types/Shortcut';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Fragment } from 'react';
import { Shortcut } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledItem = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  font-weight: ${themeCssVariables.font.weight.regular};
  height: 24px;
  justify-content: space-between;
`;

const StyledShortcuts = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type KeyboardMenuItemProps = {
  shortcut: ShortcutMenuEntry;
};

export const KeyboardMenuItem = ({ shortcut }: KeyboardMenuItemProps) => (
  <StyledItem>
    {t(shortcut.label)}
    <StyledShortcuts>
      {shortcut.shortcuts.map((definition, index) => (
        <Fragment key={index}>
          {index > 0 && t`or`}
          <Shortcut shortcut={definition} sequenceJoinLabel={t`then`} />
        </Fragment>
      ))}
    </StyledShortcuts>
  </StyledItem>
);
