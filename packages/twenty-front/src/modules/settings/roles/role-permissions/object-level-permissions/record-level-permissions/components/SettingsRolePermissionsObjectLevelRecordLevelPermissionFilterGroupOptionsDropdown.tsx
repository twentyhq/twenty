/* @license Enterprise */

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconTrash } from 'twenty-ui/icon';

import { DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET } from '@/object-record/advanced-filter/constants/DefaultAdvancedFilterDropdownSideOffset';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useRemoveRootRecordFilterGroupIfEmpty } from '@/object-record/record-filter-group/hooks/useRemoveRootRecordFilterGroupIfEmpty';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

type SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupOptionsDropdownProps =
  {
    recordFilterGroupId: string;
  };

export const SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupOptionsDropdown =
  ({
    recordFilterGroupId,
  }: SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterGroupOptionsDropdownProps) => {
    const [currentRecordFilters, setCurrentRecordFilters] =
      useAtomComponentState(currentRecordFiltersComponentState);

    const [currentRecordFilterGroups, setCurrentRecordFilterGroups] =
      useAtomComponentState(currentRecordFilterGroupsComponentState);

    const { removeRootRecordFilterGroupIfEmpty } =
      useRemoveRootRecordFilterGroupIfEmpty();

    const getDescendantRecordFilterGroupIds = (
      parentRecordFilterGroupId: string,
    ): string[] =>
      currentRecordFilterGroups
        .filter(
          (recordFilterGroup) =>
            recordFilterGroup.parentRecordFilterGroupId ===
            parentRecordFilterGroupId,
        )
        .flatMap((recordFilterGroup) => [
          recordFilterGroup.id,
          ...getDescendantRecordFilterGroupIds(recordFilterGroup.id),
        ]);

    const handleRemove = () => {
      const recordFilterGroupIdsToRemove = new Set([
        recordFilterGroupId,
        ...getDescendantRecordFilterGroupIds(recordFilterGroupId),
      ]);

      setCurrentRecordFilters(
        currentRecordFilters.filter(
          (recordFilter) =>
            !isDefined(recordFilter.recordFilterGroupId) ||
            !recordFilterGroupIdsToRemove.has(recordFilter.recordFilterGroupId),
        ),
      );
      setCurrentRecordFilterGroups(
        currentRecordFilterGroups.filter(
          (recordFilterGroup) =>
            !recordFilterGroupIdsToRemove.has(recordFilterGroup.id),
        ),
      );
      removeRootRecordFilterGroupIfEmpty();
    };

    return (
      <DropdownRoot
        dropdownId={`record-level-permission-filter-group-options-${recordFilterGroupId}`}
        type="menu"
      >
        <Dropdown.Trigger
          render={
            <IconButton
              aria-label={t`Filter group rule options`}
              variant="ghost"
            >
              <IconDotsVertical />
            </IconButton>
          }
        />
        <DropdownContent
          sideOffset={DEFAULT_ADVANCED_FILTER_DROPDOWN_SIDE_OFFSET}
        >
          <Dropdown.Section>
            <Dropdown.ActionItem
              onClick={handleRemove}
              startIcon={<IconTrash />}
              color="danger"
            >
              {t`Remove rule group`}
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </DropdownContent>
      </DropdownRoot>
    );
  };
