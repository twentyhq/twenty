import { Section } from 'twenty-ui/components/layout';
import { i18n } from '@lingui/core';
import { SettingsCardContent } from './SettingsCardContent';
import { THEME_COMMON } from 'twenty-ui/theme';
import { Card } from 'twenty-ui/primitives/surfaces';
import { type ReactNode } from 'react';
import { Switch, Button } from 'twenty-ui/primitives/input';
import { Status } from 'twenty-ui/primitives/data-display';
import { isDefined } from 'twenty-ui/utilities';
import { SegmentedControl } from 'twenty-ui/components/input';
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
import { type ActionProps } from '../types/ActionProps';
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
  hasDivider = true,
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
  hasDivider?: boolean;
}) => (
  <SettingsCardContent
    icon={icon}
    title={label}
    description={description}
    hasDivider={hasDivider}
    render={<label className="toggle-row" />}
  >
    <Switch
      aria-label={label}
      checked={state.settings[setting]}
      disabled={isPending('settings')}
      onCheckedChange={(value) =>
        void command({
          type: 'settings',
          settings: { [setting]: value },
        })
      }
    />
  </SettingsCardContent>
);

export const Settings = ({ state, isPending, command }: ActionProps) => (
  <section className="settings-page">
    <Section.Header title={i18n._('General')} />
    <Card.Root backgroundColor="var(--t-background-secondary)">
      <ShortcutSetting state={state} isPending={isPending} command={command} />
      <SettingsCardContent
        hasDivider
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
          aria-label={i18n._('Appearance')}
          disabled={isPending('settings')}
          value={state.settings.appearance}
          options={
            [
              { value: 'system', label: i18n._('System') },
              { value: 'light', label: i18n._('Light') },
              { value: 'dark', label: i18n._('Dark') },
            ] as const
          }
          onValueChange={(appearance) =>
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
        hasDivider={false}
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
    </Card.Root>
    <Section.Header title={i18n._('Meetings')} className="section" />
    <Card.Root backgroundColor="var(--t-background-secondary)">
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
        hasDivider
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
            <Status color="blue">{i18n._('Enabled')}</Status>
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
            variant="outline"
            size="md"
          >
            {state.permissions.accessibility === 'denied'
              ? i18n._('Open settings')
              : i18n._('Enable')}
          </Button>
        )}
      </SettingsCardContent>
      <SettingsCardContent
        render={
          <button
            disabled={
              isPending('begin-permission-setup') ||
              isDefined(state.activeRecording)
            }
            onClick={() => void command({ type: 'begin-permission-setup' })}
          />
        }
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
    </Card.Root>
    <Section.Header title={i18n._('Workspace')} className="section" />
    <Card.Root backgroundColor="var(--t-background-secondary)">
      <SettingsCardContent
        hasDivider
        render={
          <button
            disabled={isPending('open-calendar-settings')}
            onClick={() => void command({ type: 'open-calendar-settings' })}
          />
        }
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
      <SettingsCardContent
        icon={<WorkspaceIcon workspace={state.workspace} />}
        title={state.workspace?.name}
        description={<span className="selectable">{state.serverUrl}</span>}
      >
        <Button
          disabled={isPending('disconnect') || !!state.activeRecording}
          onClick={() => void command({ type: 'disconnect' })}
          variant="outline"
          size="md"
        >
          {i18n._('Disconnect')}
        </Button>
      </SettingsCardContent>
    </Card.Root>
  </section>
);
