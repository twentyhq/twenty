import { useEffect, useState } from 'react';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { Button } from 'twenty-ui/primitives/input';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';
import {
  RecordFilterGroupLogicalOperator,
  type RecordPermissionCondition,
} from 'twenty-shared/types';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { useSetRecordFilterUsedInAdvancedFilterDropdownRow } from '@/object-record/advanced-filter/hooks/useSetRecordFilterUsedInAdvancedFilterDropdownRow';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useRecordLevelPermissionFilterActions } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/hooks/useRecordLevelPermissionFilterActions';
import { SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/components/SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow';
import {
  recordPermissionConditionToFilters,
  recordPermissionFiltersToCondition,
} from '@/settings/record-permissions/utils/recordPermissionConditionFilters';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';

const StyledFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;
const StyledGroup = styled.div`
  border-left: 1px solid ${themeCssVariables.border.color.medium};
  padding-left: ${themeCssVariables.spacing[3]};
`;

type RecordPermissionConditionEditorProps = {
  ruleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  condition: RecordPermissionCondition;
  onChange: (condition: RecordPermissionCondition) => void;
};

type RecordPermissionConditionEditorContentProps =
  RecordPermissionConditionEditorProps;

const RecordPermissionConditionEditorContent = ({
  ruleId,
  objectMetadataItem,
  condition,
  onChange,
}: RecordPermissionConditionEditorContentProps) => {
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const memberObject = objectMetadataItems.find(
    (object) => object.nameSingular === 'workspaceMember',
  );
  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );
  const currentRecordFilterGroups = useAtomComponentStateValue(
    currentRecordFilterGroupsComponentState,
  );
  const setCurrentRecordFilters = useSetAtomComponentState(
    currentRecordFiltersComponentState,
  );
  const setCurrentRecordFilterGroups = useSetAtomComponentState(
    currentRecordFilterGroupsComponentState,
  );
  const { setRecordFilterUsedInAdvancedFilterDropdownRow } =
    useSetRecordFilterUsedInAdvancedFilterDropdownRow();
  const [initializationError, setInitializationError] = useState<string>();
  const [bridge, setBridge] = useState<{
    source: string;
    filters: string;
    applying: boolean;
  } | null>(null);
  const { handleCreateFirstFilter, handleAddFilter } =
    useRecordLevelPermissionFilterActions({ objectMetadataItem });

  // Existing filter controls write atoms; retain their round-trip state without dirtying an untouched rule.
  useEffect(() => {
    const source = JSON.stringify(condition);

    if (bridge?.source === source) return;
    try {
      const initial = recordPermissionConditionToFilters(
        condition,
        ruleId,
        objectMetadataItem,
        memberObject,
      );
      setBridge({
        source,
        filters: JSON.stringify(initial),
        applying: true,
      });
      setCurrentRecordFilters(initial.filters);
      setCurrentRecordFilterGroups(initial.groups);
      initial.filters.forEach(setRecordFilterUsedInAdvancedFilterDropdownRow);
      setInitializationError(undefined);
    } catch (error) {
      setInitializationError(
        error instanceof Error
          ? error.message
          : t`This condition cannot be edited.`,
      );
    }
  }, [
    bridge,
    condition,
    ruleId,
    objectMetadataItem,
    memberObject,
    setCurrentRecordFilters,
    setCurrentRecordFilterGroups,
    setRecordFilterUsedInAdvancedFilterDropdownRow,
  ]);

  useEffect(() => {
    if (!bridge || initializationError) return;
    const serialized = JSON.stringify({
      filters: currentRecordFilters,
      groups: currentRecordFilterGroups,
    });

    if (bridge.applying) {
      if (serialized === bridge.filters)
        setBridge({ ...bridge, applying: false });
      return;
    }
    if (serialized === bridge.filters) return;
    try {
      const next = recordPermissionFiltersToCondition(
        currentRecordFilters,
        currentRecordFilterGroups,
        objectMetadataItem,
        memberObject,
      );
      setBridge({
        source: JSON.stringify(next),
        filters: serialized,
        applying: false,
      });
      onChange(next);
    } catch (error) {
      setInitializationError(
        error instanceof Error
          ? error.message
          : t`This condition cannot be edited.`,
      );
    }
  }, [
    bridge,
    currentRecordFilters,
    currentRecordFilterGroups,
    objectMetadataItem,
    memberObject,
    onChange,
    initializationError,
  ]);

  const addGroup = (parent: RecordFilterGroup) => {
    const child = {
      id: v4(),
      parentRecordFilterGroupId: parent.id,
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
      positionInRecordFilterGroup:
        currentRecordFilters.length + currentRecordFilterGroups.length,
    };
    setCurrentRecordFilterGroups([...currentRecordFilterGroups, child]);
    handleAddFilter(child);
  };

  const renderGroup = (group: RecordFilterGroup) => (
    <StyledFilters key={group.id}>
      {currentRecordFilters
        .filter((filter) => filter.recordFilterGroupId === group.id)
        .map((filter, index) => (
          <SettingsRolePermissionsObjectLevelRecordLevelPermissionFilterRow
            key={filter.id}
            recordFilter={filter}
            index={index}
            recordFilterGroup={group}
          />
        ))}
      {currentRecordFilterGroups
        .filter((child) => child.parentRecordFilterGroupId === group.id)
        .map((child) => (
          <StyledGroup key={child.id}>{renderGroup(child)}</StyledGroup>
        ))}
      <Button
        size="sm"
        variant="ghost"
        startIcon={<IconPlus />}
        onClick={() => handleAddFilter(group)}
      >{t`Add condition`}</Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => addGroup(group)}
      >{t`Add condition group`}</Button>
    </StyledFilters>
  );
  const root = currentRecordFilterGroups.find(
    (group) => !group.parentRecordFilterGroupId,
  );
  if (initializationError)
    return <span role="alert">{initializationError}</span>;
  return (
    <AdvancedFilterContext.Provider value={{ objectMetadataItem }}>
      {root ? (
        renderGroup(root)
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={handleCreateFirstFilter}
        >{t`Add condition`}</Button>
      )}
    </AdvancedFilterContext.Provider>
  );
};

export const RecordPermissionConditionEditor = (
  props: RecordPermissionConditionEditorProps,
) => {
  const instanceId = `permission-rule-${props.ruleId}`;
  return (
    <RecordFilterGroupsComponentInstanceContext.Provider value={{ instanceId }}>
      <RecordFiltersComponentInstanceContext.Provider value={{ instanceId }}>
        <RecordPermissionConditionEditorContent
          ruleId={props.ruleId}
          objectMetadataItem={props.objectMetadataItem}
          condition={props.condition}
          onChange={props.onChange}
        />
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
