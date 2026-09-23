import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton, Section } from 'twenty-ui/components';
import { Tag } from 'twenty-ui/primitives/data-display';
import { IconPencil } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceUsageLimitModal } from '@/settings/admin-panel/components/SettingsAdminWorkspaceUsageLimitModal';
import { WORKSPACE_USAGE_LIMITS } from '@/settings/admin-panel/graphql/queries/workspaceUsageLimits';
import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { buildAdminUsageLimitRows } from '@/settings/admin-panel/utils/buildAdminUsageLimitRows';
import { formatUsageLimitValue } from '@/settings/admin-panel/utils/formatUsageLimitValue';
import {
  getAdminUsageLimitOperationLabel,
  getAdminUsageLimitPeriodLabel,
  getAdminUsageLimitResourceLabel,
  getAdminUsageLimitSpenderLabel,
} from '@/settings/admin-panel/utils/getAdminUsageLimitScopeLabel';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type WorkspaceUsageLimitsQuery } from '~/generated-admin/graphql';

type SettingsAdminWorkspaceUsageLimitsSectionProps = {
  workspaceId: string;
};

const EDIT_LIMIT_DIALOG_ID = 'settings-admin-usage-limit-edit';

// Every row is its own grid, so fixed widths keep the columns lined up between
// rows whose tags differ in width.
const USAGE_LIMITS_GRID_AUTO_COLUMNS = '1fr 120px 120px 110px 100px 36px';

export const SettingsAdminWorkspaceUsageLimitsSection = ({
  workspaceId,
}: SettingsAdminWorkspaceUsageLimitsSectionProps) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const { openDialog } = useDialog();

  const [editedRow, setEditedRow] = useState<AdminUsageLimitRow | null>(null);

  const { data, loading } = useQuery<WorkspaceUsageLimitsQuery>(
    WORKSPACE_USAGE_LIMITS,
    {
      client: apolloAdminClient,
      variables: { workspaceId },
      fetchPolicy: 'network-only',
    },
  );

  if (loading) {
    return <SettingsSectionSkeletonLoader rowCount={4} />;
  }

  const rows = isDefined(data)
    ? buildAdminUsageLimitRows(data.workspaceUsageLimits)
    : [];

  const handleEditClick = (row: AdminUsageLimitRow) => {
    setEditedRow(row);
    openDialog(EDIT_LIMIT_DIALOG_ID);
  };

  return (
    <Section.Root>
      <SettingsTableListSection<AdminUsageLimitRow>
        title={t`Limits`}
        description={t`What caps this workspace. Instance defaults come from config variables and only an operator can replace one.`}
        items={rows}
        columns={[
          {
            label: t`Scope`,
            overflow: 'hidden',
            Cell: ({ item }) => (
              <OverflowingTextWithTooltip
                text={`${getAdminUsageLimitResourceLabel(item)} · ${getAdminUsageLimitOperationLabel(item)}`}
              />
            ),
          },
          {
            label: t`Applies to`,
            overflow: 'hidden',
            Cell: ({ item }) => (
              <OverflowingTextWithTooltip
                text={getAdminUsageLimitSpenderLabel(item)}
              />
            ),
          },
          {
            label: t`Limit`,
            Cell: ({ item }) => (
              <>
                {formatUsageLimitValue({
                  value: item.limitValue,
                  meter: item.meter,
                })}
              </>
            ),
          },
          {
            label: t`Per`,
            Cell: ({ item }) => <>{getAdminUsageLimitPeriodLabel(item)}</>,
          },
          {
            label: t`Source`,
            Cell: ({ item }) =>
              item.isOverridden ? (
                <Tag color="blue">{t`Override`}</Tag>
              ) : (
                <Tag color="green">{t`Default`}</Tag>
              ),
          },
          {
            label: '',
            align: 'right',
            Cell: ({ item }) => (
              <LightIconButton
                emphasis="subtle"
                aria-label={t`Edit`}
                onClick={() => handleEditClick(item)}
              >
                <IconPencil />
              </LightIconButton>
            ),
          },
        ]}
        gridAutoColumns={USAGE_LIMITS_GRID_AUTO_COLUMNS}
      />

      <SettingsAdminWorkspaceUsageLimitModal
        dialogId={EDIT_LIMIT_DIALOG_ID}
        workspaceId={workspaceId}
        row={editedRow}
      />
    </Section.Root>
  );
};
