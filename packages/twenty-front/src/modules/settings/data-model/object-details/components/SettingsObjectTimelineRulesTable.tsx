import { SettingsNameCellSecondaryLabel } from '@/settings/components/SettingsNameCellSecondaryLabel';
import {
  type SettingsTimelineActivityRule,
  type SettingsTimelineActivityRuleAction,
} from '@/settings/data-model/object-details/utils/getSettingsTimelineActivityRules';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const TIMELINE_RULE_TABLE_ROW_GRID_TEMPLATE_COLUMNS =
  'minmax(0, 1fr) 148px 244px';

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

type SettingsObjectTimelineRulesTableProps = {
  timelineActivityRules: SettingsTimelineActivityRule[];
};

export const SettingsObjectTimelineRulesTable = ({
  timelineActivityRules,
}: SettingsObjectTimelineRulesTableProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  const actionLabels: Record<SettingsTimelineActivityRuleAction, string> = {
    linked: t`Linked`,
    unlinked: t`Unlinked`,
    updated: t`Updated`,
  };

  const getEventsLabel = (rule: SettingsTimelineActivityRule) =>
    rule.actions
      .map((action) => {
        if (action === 'updated' && rule.triggerFieldMetadataItems.length > 0) {
          const triggerFieldLabels = rule.triggerFieldMetadataItems
            .map((field) => field.label)
            .join(', ');

          return `${actionLabels[action]} (${triggerFieldLabels})`;
        }

        return actionLabels[action];
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
      </TableRow>
      <TableBody>
        {timelineActivityRules.map((rule) => {
          const Icon = getIcon(rule.sourceObjectMetadataItem.icon);

          return (
            <TableRow
              key={`${rule.sourceObjectMetadataItem.id}-${rule.viaFieldMetadataItem?.id ?? 'participants'}`}
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
                    title={rule.sourceObjectMetadataItem.labelPlural}
                  >
                    {rule.sourceObjectMetadataItem.labelPlural}
                  </StyledNameLabel>
                  {!rule.isConfigurable && (
                    <SettingsNameCellSecondaryLabel>
                      {t`System`}
                    </SettingsNameCellSecondaryLabel>
                  )}
                </StyledNameContainer>
              </TableCell>
              <TableCell>
                {rule.viaFieldMetadataItem?.label ?? t`Participants`}
              </TableCell>
              <TableCell>{getEventsLabel(rule)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
