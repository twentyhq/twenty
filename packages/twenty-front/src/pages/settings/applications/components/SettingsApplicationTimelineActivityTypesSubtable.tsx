import {
  StyledActionTableCell,
  StyledNameTableCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { TableSection } from '@/ui/layout/table/components/TableSection';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconRestore, useIcons } from 'twenty-ui/icon';
import { Checkbox, LightIconButton } from 'twenty-ui/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type SettingsApplicationTimelineActivityType } from '~/pages/settings/applications/types/settingsApplicationTimelineActivityType';

const GRID_TEMPLATE_COLUMNS = 'minmax(200px, 1fr) 180px 80px 32px';

export const SettingsApplicationTimelineActivityTypesSubtable = ({
  canReset,
  mutatingTimelineActivityTypeIds,
  onReset,
  onToggle,
  timelineActivityTypes,
}: {
  canReset: boolean;
  mutatingTimelineActivityTypeIds: ReadonlySet<string>;
  onReset: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  timelineActivityTypes: SettingsApplicationTimelineActivityType[];
}) => {
  const { theme } = useContext(ThemeContext);
  const { getIcon } = useIcons();

  if (!isNonEmptyArray(timelineActivityTypes)) {
    return null;
  }

  return (
    <TableSection title={t`Timeline activity types`}>
      {timelineActivityTypes.map((timelineActivityType) => {
        const Icon = getIcon(timelineActivityType.icon);
        const isMutating = mutatingTimelineActivityTypeIds.has(
          timelineActivityType.id,
        );

        return (
          <TableRow
            key={timelineActivityType.id}
            gridTemplateColumns={GRID_TEMPLATE_COLUMNS}
          >
            <StyledNameTableCell minWidth="0" overflow="hidden">
              {isDefined(Icon) && (
                <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              )}
              <OverflowingTextWithTooltip text={timelineActivityType.label} />
            </StyledNameTableCell>
            <TableCell
              align="right"
              color={themeCssVariables.font.color.secondary}
              minWidth="0"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              <OverflowingTextWithTooltip
                text={
                  isDefined(timelineActivityType.action)
                    ? `${timelineActivityType.name} · ${timelineActivityType.action}`
                    : timelineActivityType.name
                }
              />
            </TableCell>
            <TableCell align="right">
              {timelineActivityType.isInstalled && (
                <Checkbox
                  aria-label={t`Active`}
                  checked={timelineActivityType.isActive}
                  disabled={isMutating}
                  onChange={() =>
                    onToggle(
                      timelineActivityType.id,
                      !timelineActivityType.isActive,
                    )
                  }
                />
              )}
            </TableCell>
            <StyledActionTableCell>
              {timelineActivityType.isInstalled && canReset && (
                <LightIconButton
                  Icon={IconRestore}
                  title={t`Reset to default`}
                  accent="tertiary"
                  disabled={isMutating}
                  onClick={() => onReset(timelineActivityType.id)}
                />
              )}
            </StyledActionTableCell>
          </TableRow>
        );
      })}
    </TableSection>
  );
};
