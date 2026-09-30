import { type Shortcut as ShortcutMenuEntry } from '@/keyboard-shortcut-menu/types/Shortcut';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useShortcutAccessibleKeyLabels } from '@/ui/utilities/hotkey/hooks/useShortcutAccessibleKeyLabels';
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

export const KeyboardMenuItem = ({ shortcut }: KeyboardMenuItemProps) => {
  const { t } = useLingui();
  const accessibleKeyLabels = useShortcutAccessibleKeyLabels();

  return (
    <StyledItem>
      {shortcut.label}
      <StyledShortcuts>
        {shortcut.shortcuts.map((definition, index) => (
          <Fragment key={index}>
            {index > 0 && t`or`}
            <Shortcut
              shortcut={definition}
              sequenceJoinLabel={t`then`}
              accessibleKeyLabels={accessibleKeyLabels}
            />
          </Fragment>
        ))}
      </StyledShortcuts>
    </StyledItem>
  );
};
