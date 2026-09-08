import { DEFAULT_SETTINGS } from '../shared/types';
import { shortcutFromKeyboardEvent, formatShortcut } from './shortcut';
import { i18n } from '@lingui/core';
import { SettingsCardContent } from './components/SettingsCardContent/SettingsCardContent';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { IconButton } from '@ui/input/IconButton/IconButton';
import { useState } from 'react';
import { IconCommand, IconRestore } from 'twenty-ui/icon';
import { Button } from '@ui/input/Button/Button';
import { type ActionProps } from './components';

export const ShortcutSetting = ({ state, isPending, command }: ActionProps) => {
  const [capturing, setCapturing] = useState(false);
  return (
    <SettingsCardContent
      icon={
        <IconCommand
          size={THEME_COMMON.icon.size.md}
          stroke={THEME_COMMON.icon.stroke.sm}
        />
      }
      title={i18n._('Open companion shortcut')}
      description={
        capturing
          ? i18n._(
              'Press Control, Option / Alt, or Command with a key. Escape cancels.',
            )
          : i18n._('Open Twenty from anywhere on your computer.')
      }
    >
      <div className="button-group shortcut-actions">
        {state.settings.openShortcut !== DEFAULT_SETTINGS.openShortcut && (
          <IconButton
            variant="tertiary"
            ariaLabel={i18n._('Reset shortcut')}
            disabled={isPending('settings')}
            onClick={() =>
              void command({
                type: 'settings',
                settings: { openShortcut: DEFAULT_SETTINGS.openShortcut },
              })
            }
            size="medium"
            Icon={IconRestore}
          />
        )}
        <div
          onBlur={() => setCapturing(false)}
          onKeyDown={(event) => {
            if (!capturing) return;
            event.preventDefault();
            event.stopPropagation();
            if (event.key === 'Escape') {
              setCapturing(false);
              return;
            }
            const shortcut = shortcutFromKeyboardEvent(event);
            if (!shortcut) return;
            setCapturing(false);
            void command({
              type: 'settings',
              settings: { openShortcut: shortcut },
            });
          }}
        >
          <Button
            ariaLabel={i18n._('Change open companion shortcut')}
            disabled={isPending('settings')}
            onClick={() => setCapturing(true)}
            variant="secondary"
            size="medium"
            title={
              capturing
                ? i18n._('Press shortcut…')
                : formatShortcut(
                    state.settings.openShortcut,
                    navigator.platform.startsWith('Mac'),
                  )
            }
          />
        </div>
      </div>
    </SettingsCardContent>
  );
};
