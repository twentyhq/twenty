import { SettingsAdminUpgradeStatusRightContainer } from '@/settings/admin-panel/health-status/components/SettingsAdminUpgradeStatusRightContainer';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconId,
  IconProgressCheck,
  IconStatusChange,
  type IconComponent,
} from 'twenty-ui/display';
import { type GetInstanceAndAllWorkspacesUpgradeStatusQuery } from '~/generated-admin/graphql';

type InstanceAndAllWorkspacesUpgradeStatus =
  GetInstanceAndAllWorkspacesUpgradeStatusQuery['getInstanceAndAllWorkspacesUpgradeStatus'];

export type UpgradeStatusRowKind =
  | 'inferred-version'
  | 'instance-status'
  | 'workspaces-status';

export type UpgradeStatusRow = {
  id: UpgradeStatusRowKind;
  kind: UpgradeStatusRowKind;
  label: string;
  inferredVersion: string | null | undefined;
  instanceHealth: InstanceAndAllWorkspacesUpgradeStatus['instanceUpgradeStatus']['health'];
  behindCount: number;
  failedCount: number;
};

const ROW_ICON_BY_KIND: Record<UpgradeStatusRowKind, IconComponent> = {
  'inferred-version': IconId,
  'instance-status': IconProgressCheck,
  'workspaces-status': IconStatusChange,
};

const SETTINGS_PATH_BY_KIND: Record<UpgradeStatusRowKind, SettingsPath> = {
  'inferred-version': SettingsPath.AdminPanelInferredVersion,
  'instance-status': SettingsPath.AdminPanelInstanceStatus,
  'workspaces-status': SettingsPath.AdminPanelWorkspacesStatus,
};

type SettingsAdminUpgradeStatusListCardProps = {
  upgradeStatus: Pick<
    InstanceAndAllWorkspacesUpgradeStatus,
    'instanceUpgradeStatus' | 'workspacesBehind' | 'workspacesFailed'
  >;
};

export const SettingsAdminUpgradeStatusListCard = ({
  upgradeStatus,
}: SettingsAdminUpgradeStatusListCardProps) => {
  const sharedRowProps = {
    inferredVersion: upgradeStatus.instanceUpgradeStatus.inferredVersion,
    instanceHealth: upgradeStatus.instanceUpgradeStatus.health,
    behindCount: upgradeStatus.workspacesBehind.length,
    failedCount: upgradeStatus.workspacesFailed.length,
  };

  const items: UpgradeStatusRow[] = [
    {
      id: 'inferred-version',
      kind: 'inferred-version',
      label: t`Inferred version`,
      ...sharedRowProps,
    },
    {
      id: 'instance-status',
      kind: 'instance-status',
      label: t`Instance status`,
      ...sharedRowProps,
    },
    {
      id: 'workspaces-status',
      kind: 'workspaces-status',
      label: t`Workspaces status`,
      ...sharedRowProps,
    },
  ];

  return (
    <SettingsListCard<UpgradeStatusRow>
      items={items}
      rounded={true}
      RowIconFn={(item) => ROW_ICON_BY_KIND[item.kind]}
      getItemLabel={(item) => item.label}
      RowRightComponent={SettingsAdminUpgradeStatusRightContainer}
      to={(item) => getSettingsPath(SETTINGS_PATH_BY_KIND[item.kind])}
    />
  );
};
