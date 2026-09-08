import { i18n } from '@lingui/core';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { Card } from '@ui/surfaces/Card/Card';
import { MainButton } from '@ui/input/MainButton/MainButton';
import {
  IconMicrophone,
  IconHeadphones,
  IconUsers,
  IconArrowUpRight,
  IconCircleDot,
} from 'twenty-ui/icon';
import { Button } from '@ui/input/Button/Button';
import { type ActionProps, SetupHeading } from './components';
import { Status } from '@ui/data-display/Status/Status';

const PermissionChecklist = ({ state, isPending, command }: ActionProps) => (
  <Card
    className="permission-list"
    backgroundColor="var(--t-background-secondary)"
  >
    {(
      [
        {
          permission: 'microphone',
          label: i18n._('Record your voice'),
          button: i18n._('Enable microphone'),
          Icon: IconMicrophone,
        },
        {
          permission: 'system-audio',
          label: i18n._('Record call audio'),
          button: i18n._('Enable system audio'),
          Icon: IconHeadphones,
        },
        {
          permission: 'accessibility',
          label: i18n._('Detect calls and speakers'),
          button: i18n._('Enable accessibility'),
          Icon: IconUsers,
        },
      ] as const
    ).map(({ permission, label, button, Icon }) => {
      const status = state.permissions[permission];
      const granted = status === 'granted';
      const denied = status === 'denied';
      return (
        <div className="permission-item" key={permission}>
          <span className="permission-icon">
            <Icon
              size={THEME_COMMON.icon.size.lg}
              stroke={THEME_COMMON.icon.stroke.sm}
            />
          </span>
          <strong className="grow">{label}</strong>
          {granted ? (
            <span role="status">
              <Status color="blue" text={i18n._('Enabled')} />
            </span>
          ) : (
            <Button
              variant="secondary"
              disabled={isPending('permission') || !state.updatedAt}
              onClick={() =>
                void command({
                  type: 'permission',
                  permission,
                })
              }
              size="medium"
              title={denied ? i18n._('Open settings') : button}
              Icon={denied ? IconArrowUpRight : undefined}
            />
          )}
        </div>
      );
    })}
  </Card>
);

export const Permissions = ({
  state,
  isPending,
  command,
  onContinue,
  intentToRecord,
}: ActionProps & { onContinue: () => void; intentToRecord: boolean }) => {
  const granted = Object.values(state.permissions).every(
    (status) => status === 'granted',
  );
  return (
    <section className="setup-card permissions-setup">
      <SetupHeading
        title={i18n._('Set up recording')}
        description={i18n._(
          'Enable audio access to transcribe your conversations and save them in Twenty.',
        )}
      />
      <PermissionChecklist
        state={state}
        isPending={isPending}
        command={command}
      />
      <MainButton
        fullWidth
        disabled={isPending('record', 'complete-setup') || !granted}
        onClick={() =>
          intentToRecord
            ? void command({
                type: 'record',
                windowId: state.permissionSetup?.windowId,
              })
            : onContinue()
        }
        Icon={intentToRecord ? IconCircleDot : undefined}
        title={intentToRecord ? i18n._('Start recording') : i18n._('Finish')}
      />
    </section>
  );
};
