import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';
import { IconChevronLeft, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

import { recordIndexRoadmapFieldBlockedByIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldBlockedByIdState';
import { recordIndexRoadmapFieldColorIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldColorIdState';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldGroupIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldGroupIdState';
import { recordIndexRoadmapFieldPlannedEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedEndIdState';
import { recordIndexRoadmapFieldPlannedStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedStartIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';
import { recordIndexRoadmapFieldStatusIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStatusIdState';

type RoadmapFieldRole =
  | 'start'
  | 'end'
  | 'group'
  | 'color'
  | 'plannedStart'
  | 'plannedEnd'
  | 'status'
  | 'blockedBy';

type ObjectOptionsDropdownRoadmapFieldPickerContentProps = {
  role: RoadmapFieldRole;
};

// Per-role config — what field types are allowed and which view column the
// picker writes back when a field is selected. Keeping the matrix in one
// place avoids the prior chain of nested ternaries that made the file hard
// to extend each time a new role landed.
const FIELD_TYPES_BY_ROLE: Record<RoadmapFieldRole, FieldMetadataType[]> = {
  start: [],
  end: [],
  // Group accepts SELECT (interactive cross-swimlane drop) and RELATION
  // (read-only single swimlane). Backend validation in
  // `flat-view-validator.service.ts` enforces the same union, so the
  // picker matches what the validator will accept.
  group: [FieldMetadataType.SELECT, FieldMetadataType.RELATION],
  color: [FieldMetadataType.SELECT],
  plannedStart: [],
  plannedEnd: [],
  status: [FieldMetadataType.SELECT],
  blockedBy: [FieldMetadataType.SELECT],
};

const DATE_ROLES = new Set<RoadmapFieldRole>([
  'start',
  'end',
  'plannedStart',
  'plannedEnd',
]);

const CLEARABLE_ROLES = new Set<RoadmapFieldRole>([
  'group',
  'color',
  'plannedStart',
  'plannedEnd',
  'status',
  'blockedBy',
]);

// Shared picker sub-page for every per-field ROADMAP setting. The `role`
// prop decides which field subset is listed (DATE for date roles, SELECT
// for SELECT roles) and which view column is persisted on select.
export const ObjectOptionsDropdownRoadmapFieldPickerContent = ({
  role,
}: ObjectOptionsDropdownRoadmapFieldPickerContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem, resetContent, closeDropdown } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();

  const setRecordIndexRoadmapFieldStartId = useSetAtomState(
    recordIndexRoadmapFieldStartIdState,
  );
  const setRecordIndexRoadmapFieldEndId = useSetAtomState(
    recordIndexRoadmapFieldEndIdState,
  );
  const setRecordIndexRoadmapFieldGroupId = useSetAtomState(
    recordIndexRoadmapFieldGroupIdState,
  );
  const setRecordIndexRoadmapFieldColorId = useSetAtomState(
    recordIndexRoadmapFieldColorIdState,
  );
  const setRecordIndexRoadmapFieldPlannedStartId = useSetAtomState(
    recordIndexRoadmapFieldPlannedStartIdState,
  );
  const setRecordIndexRoadmapFieldPlannedEndId = useSetAtomState(
    recordIndexRoadmapFieldPlannedEndIdState,
  );
  const setRecordIndexRoadmapFieldStatusId = useSetAtomState(
    recordIndexRoadmapFieldStatusIdState,
  );
  const setRecordIndexRoadmapFieldBlockedById = useSetAtomState(
    recordIndexRoadmapFieldBlockedByIdState,
  );

  const availableFields = objectMetadataItem.fields.filter((field) => {
    if (DATE_ROLES.has(role)) {
      return isFieldMetadataDateKind(field.type);
    }
    const allowed = FIELD_TYPES_BY_ROLE[role];
    return allowed.includes(field.type);
  });

  const currentFieldId = (() => {
    switch (role) {
      case 'start':
        return currentView?.roadmapFieldStartId;
      case 'end':
        return currentView?.roadmapFieldEndId;
      case 'group':
        return currentView?.roadmapFieldGroupId;
      case 'color':
        return currentView?.roadmapFieldColorId;
      case 'plannedStart':
        return currentView?.roadmapFieldPlannedStartId;
      case 'plannedEnd':
        return currentView?.roadmapFieldPlannedEndId;
      case 'status':
        return currentView?.roadmapFieldStatusId;
      case 'blockedBy':
        return currentView?.roadmapFieldBlockedById;
    }
  })();

  // Start/end must differ from each other; same for plannedStart/plannedEnd.
  // Other roles have no such conflict constraint.
  const otherFieldId = (() => {
    if (role === 'start') return currentView?.roadmapFieldEndId;
    if (role === 'end') return currentView?.roadmapFieldStartId;
    if (role === 'plannedStart') return currentView?.roadmapFieldPlannedEndId;
    if (role === 'plannedEnd') return currentView?.roadmapFieldPlannedStartId;
    return null;
  })();

  const currentField = currentFieldId
    ? objectMetadataItem.fields.find((field) => field.id === currentFieldId)
    : undefined;

  const filteredFields = availableFields.filter((field) =>
    field.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const persistFieldId = async (
    fieldId: string | null,
  ): Promise<void> => {
    switch (role) {
      case 'start':
        if (fieldId === null) return;
        setRecordIndexRoadmapFieldStartId(fieldId);
        await updateCurrentView({ roadmapFieldStartId: fieldId });
        return;
      case 'end':
        if (fieldId === null) return;
        setRecordIndexRoadmapFieldEndId(fieldId);
        await updateCurrentView({ roadmapFieldEndId: fieldId });
        return;
      case 'group':
        setRecordIndexRoadmapFieldGroupId(fieldId);
        await updateCurrentView({ roadmapFieldGroupId: fieldId });
        return;
      case 'color':
        setRecordIndexRoadmapFieldColorId(fieldId);
        await updateCurrentView({ roadmapFieldColorId: fieldId });
        return;
      case 'plannedStart':
        setRecordIndexRoadmapFieldPlannedStartId(fieldId);
        await updateCurrentView({ roadmapFieldPlannedStartId: fieldId });
        return;
      case 'plannedEnd':
        setRecordIndexRoadmapFieldPlannedEndId(fieldId);
        await updateCurrentView({ roadmapFieldPlannedEndId: fieldId });
        return;
      case 'status':
        setRecordIndexRoadmapFieldStatusId(fieldId);
        await updateCurrentView({ roadmapFieldStatusId: fieldId });
        return;
      case 'blockedBy':
        setRecordIndexRoadmapFieldBlockedById(fieldId);
        await updateCurrentView({ roadmapFieldBlockedById: fieldId });
        return;
    }
  };

  const handleSelect = async (field: FieldMetadataItem) => {
    if (field.id === otherFieldId) {
      // Backend would reject start === end (or plannedStart === plannedEnd);
      // keep the dropdown open so the user can try another field.
      return;
    }
    try {
      await persistFieldId(field.id);
    } catch (error) {
      // Surface the specific GraphQL error to the dev console — the
      // generic Apollo snackbar swallows it and the user only sees
      // "An error occurred". This keeps the UI honest while we debug.
      // eslint-disable-next-line no-console
      console.error(
        '[Roadmap field picker] persist failed',
        { role, fieldId: field.id, fieldType: field.type },
        error,
      );
      throw error;
    }
    closeDropdown();
  };

  const handleClear = async () => {
    if (!CLEARABLE_ROLES.has(role)) return;
    try {
      await persistFieldId(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Roadmap field picker] clear failed', { role }, error);
      throw error;
    }
    closeDropdown();
  };

  const headerLabel = (() => {
    switch (role) {
      case 'start':
        return t`Start date field`;
      case 'end':
        return t`End date field`;
      case 'group':
        return t`Group field`;
      case 'color':
        return t`Color field`;
      case 'plannedStart':
        return t`Planned start field`;
      case 'plannedEnd':
        return t`Planned end field`;
      case 'status':
        return t`Status field`;
      case 'blockedBy':
        return t`Blocked-by field`;
    }
  })();

  const clearLabel = (() => {
    switch (role) {
      case 'group':
        return t`No grouping`;
      case 'color':
        return t`No color`;
      case 'plannedStart':
      case 'plannedEnd':
        return t`No planned date`;
      case 'status':
        return t`No status`;
      case 'blockedBy':
        return t`No blocker`;
      default:
        return null;
    }
  })();

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => resetContent()}
            Icon={IconChevronLeft}
          />
        }
      >
        {headerLabel}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInput}
        placeholder={t`Search fields`}
        onChange={(event) => setSearchInput(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        {clearLabel !== null && currentField !== undefined && (
          <MenuItemSelect
            selected={false}
            onClick={handleClear}
            text={clearLabel}
          />
        )}
        {filteredFields.map((field) => (
          <MenuItemSelect
            key={field.id}
            selected={field.id === currentField?.id}
            disabled={field.id === otherFieldId}
            onClick={() => handleSelect(field)}
            LeftIcon={getIcon(field.icon)}
            text={field.label}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
