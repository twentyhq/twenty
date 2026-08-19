import { SettingsNameCellSecondaryLabel } from '@/settings/components/SettingsNameCellSecondaryLabel';
import { SettingsObjectTimelineRuleActionDropdown } from '@/settings/data-model/timeline-rules/components/SettingsObjectTimelineRuleActionDropdown';
import { type SettingsTimelineRuleRow } from '@/settings/data-model/timeline-rules/utils/getSettingsTimelineRuleRows';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const TIMELINE_RULE_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 132px 216px 36px';

const StyledNameContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledNameLabel = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TIMELINE_RULE_ACTION_DISPLAY_ORDER = [
  'linked',
  'unlinked',
  'updated',
  'created',
  'deleted',
  'restored',
];

type SettingsObjectTimelineRulesTableProps = {
  timelineRuleRows: SettingsTimelineRuleRow[];
  isReadOnly: boolean;
  onEdit: (row: SettingsTimelineRuleRow) => void;
  onToggleActive: (row: SettingsTimelineRuleRow) => void;
  onReset: (row: SettingsTimelineRuleRow) => void;
};

export const SettingsObjectTimelineRulesTable = ({
  timelineRuleRows,
  isReadOnly,
  onEdit,
  onToggleActive,
  onReset,
}: SettingsObjectTimelineRulesTableProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const actionLabels: Record<string, string> = {
    linked: t`Linked`,
    unlinked: t`Unlinked`,
    updated: t`Updated`,
    created: t`Created`,
    deleted: t`Deleted`,
    restored: t`Restored`,
  };

  const getEventsLabel = (row: SettingsTimelineRuleRow) =>
    [...row.actions]
      .sort(
        (left, right) =>
          TIMELINE_RULE_ACTION_DISPLAY_ORDER.indexOf(left) -
          TIMELINE_RULE_ACTION_DISPLAY_ORDER.indexOf(right),
      )
      .map((action) => {
        if (action === 'updated' && row.triggerFieldMetadataItems.length > 0) {
          const triggerFieldLabels = row.triggerFieldMetadataItems
            .map((field) => field.label)
            .join(', ');

          return `${actionLabels[action] ?? action} (${triggerFieldLabels})`;
        }

        return actionLabels[action] ?? action;
      })
      .join(' · ');

  return (
    <Table>
      <TableRow
        gridTemplateColumns={TIMELINE_RULE_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>{t`Name`}</TableHeader>
        <TableHeader>{t`Relation`}</TableHeader>
        <TableHeader>{t`Events`}</TableHeader>
        <TableHeader></TableHeader>
      </TableRow>
      <TableBody>
        {timelineRuleRows.map((row) => {
          const Icon = getIcon(row.sourceObjectMetadataItem.icon);
          const isRuleActive = row.timelineActivityRule?.isActive ?? true;

          return (
            <TableRow
              key={`${row.sourceObjectMetadataItem.id}-${row.viaFieldMetadataItem?.id ?? 'participants'}`}
              gridTemplateColumns={
                TIMELINE_RULE_TABLE_ROW_GRID_TEMPLATE_COLUMNS
              }
            >
              <TableCell
                color={themeCssVariables.font.color.primary}
                gap={themeCssVariables.spacing[2]}
              >
                <Icon
                  style={{ minWidth: theme.icon.size.md }}
                  size={theme.icon.size.md}
                  stroke={theme.icon.stroke.sm}
                />
                <StyledNameContainer>
                  <StyledNameLabel
                    title={row.sourceObjectMetadataItem.labelPlural}
                  >
                    {row.sourceObjectMetadataItem.labelPlural}
                  </StyledNameLabel>
                  {!row.isConfigurable && (
                    <SettingsNameCellSecondaryLabel>
                      {t`System`}
                    </SettingsNameCellSecondaryLabel>
                  )}
                  {!isRuleActive && (
                    <SettingsNameCellSecondaryLabel>
                      {t`Deactivated`}
                    </SettingsNameCellSecondaryLabel>
                  )}
                </StyledNameContainer>
              </TableCell>
              <TableCell>
                {row.viaFieldMetadataItem?.label ?? t`Participants`}
              </TableCell>
              <TableCell>{getEventsLabel(row)}</TableCell>
              <TableCell>
                {row.isConfigurable &&
                  !isReadOnly &&
                  isDefined(row.timelineActivityRule) && (
                    <SettingsObjectTimelineRuleActionDropdown
                      dropdownId={`timeline-rule-${row.timelineActivityRule.id ?? row.viaFieldMetadataItem?.id}`}
                      isActive={isRuleActive}
                      isResettable={row.timelineActivityRule.isOverridden}
                      onEdit={() => onEdit(row)}
                      onToggleActive={() => onToggleActive(row)}
                      onReset={() => onReset(row)}
                    />
                  )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
