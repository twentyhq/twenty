import { useQuery } from '@apollo/client/react';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton, Section } from 'twenty-ui/components';
import { IconPencil } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { type ThemeColor } from 'twenty-ui/theme';

import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { SettingsAdminWorkspaceUsageLimitModal } from '@/settings/admin-panel/components/SettingsAdminWorkspaceUsageLimitModal';
import { WORKSPACE_USAGE_LIMITS } from '@/settings/admin-panel/graphql/queries/workspaceUsageLimits';
import { type AdminUsageLimitRow } from '@/settings/admin-panel/types/AdminUsageLimitRow';
import { buildAdminUsageLimitRows } from '@/settings/admin-panel/utils/buildAdminUsageLimitRows';
import { formatUsageLimitValue } from '@/settings/admin-panel/utils/formatUsageLimitValue';
import { getAdminUsageLimitOperationLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitOperationLabel';
import { getAdminUsageLimitPeriodLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitPeriodLabel';
import { getAdminUsageLimitResourceLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitResourceLabel';
import { getAdminUsageLimitSpenderLabel } from '@/settings/admin-panel/utils/getAdminUsageLimitSpenderLabel';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsTableListSection } from '@/settings/components/SettingsTableListSection';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type WorkspaceUsageLimitsQuery } from '~/generated-admin/graphql';

type SettingsAdminWorkspaceUsageLimitsSectionProps = {
  workspaceId: string;
};

const EDIT_LIMIT_DIALOG_ID = 'settings-admin-usage-limit-edit';

const USAGE_LIMITS_GRID_AUTO_COLUMNS = '1fr 120px 120px 110px 100px 36px';

const getStatus = (
  row: AdminUsageLimitRow,
): { label: MessageDescriptor; color: ThemeColor } =>
  row.isOverridden
    ? { label: msg`Override`, color: 'blue' }
    : { label: msg`Default`, color: 'green' };

export const SettingsAdminWorkspaceUsageLimitsSection = ({
  workspaceId,
}: SettingsAdminWorkspaceUsageLimitsSectionProps) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const { openDialog } = useDialog();

  const [editedRowOpening, setEditedRowOpening] = useState<{
    rowId: string;
    sequence: number;
  } | null>(null);

  const { data, loading, error } = useQuery<WorkspaceUsageLimitsQuery>(
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

  const editedRow = isDefined(editedRowOpening)
    ? rows.find((row) => row.id === editedRowOpening.rowId)
    : undefined;

  const handleEditClick = (row: AdminUsageLimitRow) => {
    setEditedRowOpening((opening) => ({
      rowId: row.id,
      sequence: (opening?.sequence ?? 0) + 1,
    }));
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
            Cell: ({ item }) => {
              const status = getStatus(item);

              return <Tag color={status.color}>{t(status.label)}</Tag>;
            },
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

      {isDefined(error) && (
        <SettingsEmptyPlaceholder>{t`Failed to load usage limits.`}</SettingsEmptyPlaceholder>
      )}

      {isDefined(editedRow) && isDefined(editedRowOpening) && (
        <SettingsAdminWorkspaceUsageLimitModal
          key={`${editedRowOpening.rowId}:${editedRowOpening.sequence}`}
          dialogId={EDIT_LIMIT_DIALOG_ID}
          workspaceId={workspaceId}
          row={editedRow}
        />
      )}
    </Section.Root>
  );
};
