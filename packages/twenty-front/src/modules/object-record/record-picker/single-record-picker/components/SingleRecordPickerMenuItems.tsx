import { isNonEmptyString, isUndefined } from '@sniptt/guards';
import { useRef } from 'react';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';
import { IconComponent, MenuItemSelect } from 'twenty-ui';

import { DropdownMenuSkeletonItem } from '@/ui/input/relation-picker/components/skeletons/DropdownMenuSkeletonItem';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { isDefined } from 'twenty-shared';

import { SingleRecordPickerMenuItem } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';
import { singleRecordPickerSelectedIdComponentState } from '@/object-record/record-picker/single-record-picker/states/singleRecordPickerSelectedIdComponentState';
import { SingleRecordPickerHotkeyScope } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerHotkeyScope';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { getSingleRecordPickerSelectableListId } from '@/object-record/record-picker/single-record-picker/utils/getSingleRecordPickerSelectableListId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import styled from '@emotion/styled';

export type SingleRecordPickerMenuItemsProps = {
  EmptyIcon?: IconComponent;
  emptyLabel?: string;
  recordsToSelect: SingleRecordPickerRecord[];
  loading?: boolean;
  onCancel?: () => void;
  onRecordSelected: (entity?: SingleRecordPickerRecord) => void;
  selectedRecord?: SingleRecordPickerRecord;
  hotkeyScope?: string;
  isFiltered: boolean;
};

const StyledContainer = styled.div`
  display: flex;
`;

export const SingleRecordPickerMenuItems = ({
  EmptyIcon,
  emptyLabel,
  recordsToSelect,
  loading,
  onCancel,
  onRecordSelected,
  selectedRecord,
  hotkeyScope = SingleRecordPickerHotkeyScope.SingleRecordPicker,
  isFiltered,
}: SingleRecordPickerMenuItemsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectNone = emptyLabel
    ? {
        __typename: '',
        id: 'select-none',
        name: emptyLabel,
      }
    : null;

  const recordsInDropdown = [
    selectNone,
    selectedRecord,
    ...recordsToSelect,
  ].filter(
    (entity): entity is SingleRecordPickerRecord =>
      isDefined(entity) && isNonEmptyString(entity.name),
  );

  const recordPickerComponentInstanceId =
    useAvailableComponentInstanceIdOrThrow(
      SingleRecordPickerComponentInstanceContext,
    );

  const selectableListComponentInstanceId =
    getSingleRecordPickerSelectableListId(recordPickerComponentInstanceId);

  const { isSelectedItemIdSelector, resetSelectedItem } = useSelectableList(
    selectableListComponentInstanceId,
  );

  const isSelectedSelectNoneButton = useRecoilValue(
    isSelectedItemIdSelector('select-none'),
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      resetSelectedItem();
      onCancel?.();
    },
    hotkeyScope,
    [onCancel, resetSelectedItem],
  );

  const selectableItemIds = recordsInDropdown.map((entity) => entity.id);
  const [selectedRecordId, setSelectedRecordId] = useRecoilComponentStateV2(
    singleRecordPickerSelectedIdComponentState,
  );

  return (
    <StyledContainer ref={containerRef}>
      <SelectableList
        selectableListId={selectableListComponentInstanceId}
        selectableItemIdArray={selectableItemIds}
        hotkeyScope={hotkeyScope}
        onEnter={(itemId) => {
          const recordIndex = recordsInDropdown.findIndex(
            (record) => record.id === itemId,
          );
          setSelectedRecordId(itemId);
          onRecordSelected(recordsInDropdown[recordIndex]);
          resetSelectedItem();
        }}
      >
        <DropdownMenuItemsContainer hasMaxHeight>
          {loading && !isFiltered ? (
            <DropdownMenuSkeletonItem />
          ) : recordsInDropdown.length === 0 && !loading ? (
            <></>
          ) : (
            recordsInDropdown?.map((record) => {
              switch (record.id) {
                case 'select-none': {
                  return (
                    emptyLabel && (
                      <MenuItemSelect
                        key={record.id}
                        onClick={() => {
                          setSelectedRecordId(undefined);
                          onRecordSelected();
                        }}
                        LeftIcon={EmptyIcon}
                        text={emptyLabel}
                        selected={isUndefined(selectedRecordId)}
                        hovered={isSelectedSelectNoneButton}
                      />
                    )
                  );
                }
                default: {
                  return (
                    <SingleRecordPickerMenuItem
                      key={record.id}
                      record={record}
                      onRecordSelected={onRecordSelected}
                      selectedRecord={selectedRecord}
                    />
                  );
                }
              }
            })
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </StyledContainer>
  );
};
