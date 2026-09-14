import { i18n } from '@lingui/core';
import { H2Title } from '@ui/typography/H2Title/H2Title';
import { SettingsCardContent } from './components/SettingsCardContent/SettingsCardContent';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { Card } from '@ui/surfaces/Card/Card';
import { type ReactNode } from 'react';
import { Toggle } from '@ui/input/Toggle/Toggle';
import { Status } from '@ui/data-display/Status/Status';
import { SegmentedControl } from '@ui/input/SegmentedControl/SegmentedControl';
import {
  IconCalendarEvent,
  IconCircleDot,
  IconArrowUpRight,
  IconChevronRight,
  IconLogin2,
  IconUsers,
  IconMicrophone,
  IconBell,
  IconClock,
  IconSettings,
} from 'twenty-ui/icon';
import { Button } from '@ui/input/Button/Button';
import { type ActionProps } from './components';
import { ShortcutSetting } from './ShortcutSetting';
import { WorkspaceIcon } from './WorkspaceIcon';

const SettingsToggle = ({
  state,
  isPending,
  command,
  setting,
  icon,
  label,
  description,
}: ActionProps & {
  setting:
    | 'autoJoin'
    | 'autoRecord'
    | 'launchAtLogin'
    | 'notifyOnDetectedCall'
    | 'showMeetingCountdown';
  icon: ReactNode;
  label: string;
  description: string;
}) => (
  <label className="toggle-row">
    <SettingsCardContent icon={icon} title={label} description={description}>
      <Toggle
        aria-label={label}
        value={state.settings[setting]}
        centered
        disabled={isPending('settings')}
        onChange={(value) =>
          void command({
            type: 'settings',
            settings: { [setting]: value },
          })
        }
      />
    </SettingsCardContent>
  </label>
);

export const Settings = ({ state, isPending, command }: ActionProps) => (
  <section className="settings-page">
    <H2Title title={i18n._('General')} />
    <Card
      className="settings-group"
      backgroundColor="var(--t-background-secondary)"
    >
      <ShortcutSetting state={state} isPending={isPending} command={command} />
      <SettingsCardContent
        icon={
          <IconSettings
            size={THEME_COMMON.icon.size.md}
            stroke={THEME_COMMON.icon.stroke.sm}
          />
        }
        title={i18n._('Appearance')}
        description={i18n._('Choose how Twenty looks on this computer.')}
      >
        <SegmentedControl
          itemWidth="content"
          ariaLabel={i18n._('Appearance')}
          value={state.settings.appearance}
          options={(
            [
              { value: 'system', label: i18n._('System') },
              { value: 'light', label: i18n._('Light') },
              { value: 'dark', label: i18n._('Dark') },
            ] as const
          ).map((option) => ({ ...option, disabled: isPending('settings') }))}
          onChange={(appearance) =>
            void command({ type: 'settings', settings: { appearance } })
          }
        />
      </SettingsCardContent>
      <SettingsToggle
        state={state}
        isPending={isPending}
        command={command}
        setting="launchAtLogin"
        icon={
          <IconLogin2
            size={THEME_COMMON.icon.size.md}
            stroke={THEME_COMMON.icon.stroke.sm}
          />
        }
        label={i18n._('Launch at login')}
        description={i18n._(
          'Keep Twenty ready in the background when you sign in.',
        )}
      />
      <SettingsToggle
        state={state}
        isPending={isPending}
        command={command}
        setting="showMeetingCountdown"
        icon={
          <IconClock
            size={THEME_COMMON.icon.size.md}
            stroke={THEME_COMMON.icon.stroke.sm}
          />
        }
        label={i18n._('Meeting countdown')}
        description={i18n._(
          'Show time until your next meeting beside the tray icon.',
        )}
      />
    </Card>
    <H2Title title={i18n._('Meetings')} className="section" />
    <Card
      className="settings-group"
      backgroundColor="var(--t-background-secondary)"
    >
      {(
        [
          {
            key: 'autoJoin',
            Icon: IconCalendarEvent,
            label: i18n._('Auto-join meetings'),
            description: i18n._(
              'Open the meeting link when your calendar event starts.',
            ),
          },
          {
            key: 'autoRecord',
            Icon: IconCircleDot,
            label: i18n._('Record unscheduled calls automatically'),
            description: i18n._(
              'Start recording detected calls outside your calendar.',
            ),
          },
          {
            key: 'notifyOnDetectedCall',
            Icon: IconBell,
            label: i18n._('Call detection notifications'),
            description: i18n._(
              'Notify you when a call is detected and needs manual recording.',
            ),
          },
        ] as const
      ).map(({ key, Icon, label, description }) => (
        <SettingsToggle
          key={key}
          state={state}
          isPending={isPending}
          command={command}
          setting={key}
          icon={
            <Icon
              size={THEME_COMMON.icon.size.md}
              stroke={THEME_COMMON.icon.stroke.sm}
            />
          }
          label={label}
          description={description}
        />
      ))}
      <SettingsCardContent
        icon={
          <IconUsers
            size={THEME_COMMON.icon.size.md}
            stroke={THEME_COMMON.icon.stroke.sm}
          />
        }
        title={i18n._('Speaker tags')}
        description={i18n._('Identify who is speaking in supported calls.')}
      >
        {state.permissions.accessibility === 'granted' ? (
          <span role="status">
            <Status color="blue" text={i18n._('Enabled')} />
          </span>
        ) : (
          <Button
            disabled={
              isPending('permission') ||
              !!state.activeRecording ||
              !state.updatedAt
            }
            onClick={() =>
              void command({
                type: 'permission',
                permission: 'accessibility',
              })
            }
            variant="secondary"
            size="medium"
            title={
              state.permissions.accessibility === 'denied'
                ? i18n._('Open settings')
                : i18n._('Enable')
            }
          />
        )}
      </SettingsCardContent>
      <button
        className="settings-link"
        disabled={
          isPending('begin-permission-setup') || !!state.activeRecording
        }
        onClick={() => void command({ type: 'begin-permission-setup' })}
      >
        <SettingsCardContent
          icon={
            <IconMicrophone
              size={THEME_COMMON.icon.size.md}
              stroke={THEME_COMMON.icon.stroke.sm}
            />
          }
          title={i18n._('Recording permissions')}
          description={i18n._(
            'Manage microphone, system audio, and call detection access.',
          )}
        >
          <IconChevronRight
            size={THEME_COMMON.icon.size.md}
            stroke={THEME_COMMON.icon.stroke.sm}
          />
        </SettingsCardContent>
      </button>
    </Card>
    <H2Title title={i18n._('Workspace')} className="section" />
    <Card
      className="settings-group"
      backgroundColor="var(--t-background-secondary)"
    >
      <button
        className="settings-link"
        disabled={isPending('open-calendar-settings')}
        onClick={() => void command({ type: 'open-calendar-settings' })}
      >
        <SettingsCardContent
          icon={
            <IconCalendarEvent
              size={THEME_COMMON.icon.size.md}
              stroke={THEME_COMMON.icon.stroke.sm}
            />
          }
          title={i18n._('Calendar settings')}
          description={i18n._('Manage your connected calendars in Twenty.')}
        >
          <IconArrowUpRight
            size={THEME_COMMON.icon.size.md}
            stroke={THEME_COMMON.icon.stroke.sm}
          />
        </SettingsCardContent>
      </button>
      <SettingsCardContent
        icon={<WorkspaceIcon workspace={state.workspace} />}
        title={state.workspace?.name}
        description={<span className="selectable">{state.serverUrl}</span>}
      >
        <Button
          disabled={isPending('disconnect') || !!state.activeRecording}
          onClick={() => void command({ type: 'disconnect' })}
          variant="secondary"
          size="medium"
          title={i18n._('Disconnect')}
        />
      </SettingsCardContent>
    </Card>
  </section>
);
