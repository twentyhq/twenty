import { i18n } from '@lingui/core';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { MainButton } from '@ui/components/MainButton/MainButton';
import {
  IconMicrophone,
  IconHeadphones,
  IconUsers,
  IconArrowUpRight,
  IconCircleDot,
} from 'twenty-ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { type ActionProps } from '../types/ActionProps';
import { SetupHeading } from './SetupHeading';
import { Status } from '@ui/primitives/data-display/Status/Status';

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
              <Status color="blue">{i18n._('Enabled')}</Status>
            </span>
          ) : (
            <Button
              variant="outline"
              disabled={isPending('permission') || !state.updatedAt}
              onClick={() =>
                void command({
                  type: 'permission',
                  permission,
                })
              }
              size="md"
              startIcon={denied ? <IconArrowUpRight /> : undefined}
            >
              {denied ? i18n._('Open settings') : button}
            </Button>
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
        startIcon={intentToRecord ? <IconCircleDot /> : undefined}
      >
        {intentToRecord ? i18n._('Start recording') : i18n._('Finish')}
      </MainButton>
    </section>
  );
};
