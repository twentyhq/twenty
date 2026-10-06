import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { DashboardFilterValueDropdown } from '@/page-layout/dashboard-filters/components/DashboardFilterValueDropdown';
import { getDashboardFilterDefaultValueComponentInstanceId } from '@/page-layout/dashboard-filters/utils/getDashboardFilterDefaultValueComponentInstanceId';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useComputeRecordRelationFilterLabelValue } from '@/views/hooks/useComputeRecordRelationFilterLabelValue';
import { t } from '@lingui/core/macro';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
  type DashboardFilterValue,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { type IconComponent, IconFilter, IconX } from 'twenty-ui/icon';

type DashboardFilterDefaultValueRowProps = {
  itemId: string;
  pageLayoutId: string;
  slot: DashboardFilterSlot;
  representativeBinding: DashboardFilterBinding | undefined;
  onDefaultValueChange: (defaultValue: DashboardFilterValue | null) => void;
};

type DefaultValueMenuItemProps = {
  itemId: string;
  labelValue: string;
  Icon: IconComponent;
  onClick: () => void;
  onClear: (() => void) | undefined;
};

const DefaultValueMenuItem = ({
  itemId,
  labelValue,
  Icon,
  onClick,
  onClear,
}: DefaultValueMenuItemProps) => (
  <CommandMenuItem
    id={itemId}
    label={t`Default value`}
    Icon={Icon}
    description={labelValue}
    contextualTextPosition="right"
    hasSubMenu
    onClick={onClick}
    RightComponent={
      isDefined(onClear) ? (
        <LightIconButton
          aria-label={t`Clear default value`}
          onClick={(event) => {
            event.stopPropagation();
            onClear();
          }}
        >
          <IconX />
        </LightIconButton>
      ) : undefined
    }
  />
);

// Relation values only hold record ids, so the names in the label are fetched like for a view filter chip.
const RelationDefaultValueMenuItem = ({
  recordFilter,
  itemId,
  Icon,
  onClick,
  onClear,
}: Omit<DefaultValueMenuItemProps, 'labelValue'> & {
  recordFilter: RecordFilter;
}) => {
  const { labelValue } = useComputeRecordRelationFilterLabelValue({
    recordFilter,
  });

  return (
    <DefaultValueMenuItem
      itemId={itemId}
      labelValue={labelValue}
      Icon={Icon}
      onClick={onClick}
      onClear={onClear}
    />
  );
};

export const DashboardFilterDefaultValueRow = ({
  itemId,
  pageLayoutId,
  slot,
  representativeBinding,
  onDefaultValueChange,
}: DashboardFilterDefaultValueRowProps) => {
  const { closeDropdown } = useCloseDropdown();

  // The filter inputs borrow a bound field's widgets, so there is nothing to edit until a chart binds the slot.
  if (!isDefined(representativeBinding)) {
    return (
      <SelectableListItem itemId={itemId}>
        <CommandMenuItem
          id={itemId}
          label={t`Default value`}
          Icon={IconFilter}
          description={t`Bind a chart first`}
          contextualTextPosition="right"
          disabled
        />
      </SelectableListItem>
    );
  }

  const hasDefaultValue = isDefined(slot.defaultValue);

  return (
    <SelectableListItem itemId={itemId}>
      <DashboardFilterValueDropdown
        slot={slot}
        representativeBinding={representativeBinding}
        value={slot.defaultValue}
        onValueChange={onDefaultValueChange}
        instanceId={getDashboardFilterDefaultValueComponentInstanceId({
          pageLayoutId,
          slotId: slot.id,
        })}
        dropdownPlacement="bottom-end"
        dropdownOffset={{ y: 4 }}
        renderClickableComponent={({
          currentRecordFilter,
          labelValue,
          Icon,
          dropdownId,
          onClick,
        }) => {
          const handleClear = hasDefaultValue
            ? () => {
                closeDropdown(dropdownId);
                onDefaultValueChange(null);
              }
            : undefined;

          return isDefined(currentRecordFilter) &&
            currentRecordFilter.type === 'RELATION' ? (
            <RelationDefaultValueMenuItem
              itemId={itemId}
              recordFilter={currentRecordFilter}
              Icon={Icon}
              onClick={onClick}
              onClear={handleClear}
            />
          ) : (
            <DefaultValueMenuItem
              itemId={itemId}
              labelValue={hasDefaultValue ? labelValue : t`None`}
              Icon={Icon}
              onClick={onClick}
              onClear={handleClear}
            />
          );
        }}
      />
    </SelectableListItem>
  );
};
