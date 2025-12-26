import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { viewObjectMetadataIdComponentState } from '@/views/states/viewObjectMetadataIdComponentState';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { ViewPickerCreateButton } from '@/views/view-picker/components/ViewPickerCreateButton';
import { ViewPickerIconAndNameContainer } from '@/views/view-picker/components/ViewPickerIconAndNameContainer';
import { ViewPickerSaveButtonContainer } from '@/views/view-picker/components/ViewPickerSaveButtonContainer';
import { ViewPickerSelectContainer } from '@/views/view-picker/components/ViewPickerSelectContainer';
import { VIEW_PICKER_CALENDAR_FIELD_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerCalendarFieldDropdownId';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerKanbanFieldDropdownId';
import { VIEW_PICKER_TYPE_SELECT_OPTIONS } from '@/views/view-picker/constants/ViewPickerTypeSelectOptions';
import { VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerViewTypeDropdownId';
import { useCreateViewFromCurrentState } from '@/views/view-picker/hooks/useCreateViewFromCurrentState';
import { useGetAvailableFieldsForCalendar } from '@/views/view-picker/hooks/useGetAvailableFieldsForCalendar';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerCalendarFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerCalendarFieldMetadataIdComponentState';
import { viewPickerInputNameComponentState } from '@/views/view-picker/states/viewPickerInputNameComponentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerMainGroupByFieldMetadataIdComponentState } from '@/views/view-picker/states/viewPickerMainGroupByFieldMetadataIdComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { viewPickerTypeComponentState } from '@/views/view-picker/states/viewPickerTypeComponentState';
import { Trans, useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { IconX } from 'twenty-ui/display';

const StyledFieldAvailableContainer = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  margin: ${({ theme }) => theme.spacing(1, 2)};
  user-select: none;
  width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

export const ViewPickerContentCreateMode = () => {
  const { t } = useLingui();
  const { viewPickerMode, setViewPickerMode } = useViewPickerMode();
  const [hasManuallySelectedIcon, setHasManuallySelectedIcon] = useState(false);

  const viewObjectMetadataId = useRecoilComponentValue(
    viewObjectMetadataIdComponentState,
  );
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: viewObjectMetadataId ?? '',
  });

  const [viewPickerInputName, setViewPickerInputName] = useRecoilComponentState(
    viewPickerInputNameComponentState,
  );

  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] =
    useRecoilComponentState(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useRecoilComponentValue(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetRecoilComponentState(
    viewPickerIsDirtyComponentState,
  );

  const [
    viewPickerMainGroupByFieldMetadataId,
    setViewPickerMainGroupByFieldMetadataId,
  ] = useRecoilComponentState(
    viewPickerMainGroupByFieldMetadataIdComponentState,
  );

  const [
    viewPickerCalendarFieldMetadataId,
    setViewPickerCalendarFieldMetadataId,
  ] = useRecoilComponentState(viewPickerCalendarFieldMetadataIdComponentState);

  const [viewPickerType, setViewPickerType] = useRecoilComponentState(
    viewPickerTypeComponentState,
  );

  const { createViewFromCurrentState } = useCreateViewFromCurrentState();

  const { availableFieldsForKanban } = useGetAvailableFieldsForKanban();

  const { availableFieldsForCalendar } = useGetAvailableFieldsForCalendar();

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: async () => {
      if (viewPickerIsPersisting) {
        return;
      }

      if (
        viewPickerType === ViewType.Kanban &&
        availableFieldsForKanban.length === 0
      ) {
        return;
      }

      await createViewFromCurrentState();
    },
    focusId: VIEW_PICKER_DROPDOWN_ID,
    dependencies: [
      viewPickerIsPersisting,
      createViewFromCurrentState,
      viewPickerType,
      availableFieldsForKanban,
      availableFieldsForCalendar,
    ],
  });

  const defaultIcon = viewTypeIconMapping(viewPickerType).displayName;

  const selectedIcon = useMemo(() => {
    if (hasManuallySelectedIcon) {
      return viewPickerSelectedIcon;
    }
    if (viewPickerMode === 'create-from-current') {
      return viewPickerSelectedIcon || defaultIcon;
    }
    return defaultIcon;
  }, [
    hasManuallySelectedIcon,
    viewPickerSelectedIcon,
    viewPickerMode,
    defaultIcon,
  ]);

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
    setHasManuallySelectedIcon(true);
  };

  const handleClose = async () => {
    setViewPickerMode('list');
  };

  const objectLabel = objectMetadataItem.labelPlural;

  return (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent onClick={handleClose} Icon={IconX} />
        }
      >
        {t`Create view`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <ViewPickerIconAndNameContainer>
          <IconPicker onChange={onIconChange} selectedIconKey={selectedIcon} />
          <TextInput
            value={viewPickerInputName}
            onChange={(value) => {
              setViewPickerIsDirty(true);
              setViewPickerInputName(value);
            }}
            autoFocus
          />
        </ViewPickerIconAndNameContainer>
        <ViewPickerSelectContainer>
          <Select
            label={t`View type`}
            fullWidth
            value={viewPickerType}
            onChange={(value) => {
              setViewPickerIsDirty(true);
              setViewPickerType(value);
            }}
            options={VIEW_PICKER_TYPE_SELECT_OPTIONS.map((option) => ({
              ...option,
              label: t(option.label),
            }))}
            dropdownId={VIEW_PICKER_VIEW_TYPE_DROPDOWN_ID}
          />
        </ViewPickerSelectContainer>
        {viewPickerType === ViewType.Kanban && (
          <>
            <ViewPickerSelectContainer>
              <Select
                label={t`Stages`}
                fullWidth
                value={viewPickerMainGroupByFieldMetadataId}
                onChange={(value) => {
                  setViewPickerIsDirty(true);
                  setViewPickerMainGroupByFieldMetadataId(value);
                }}
                options={
                  availableFieldsForKanban.length > 0
                    ? availableFieldsForKanban.map((field) => ({
                        value: field.id,
                        label: field.label,
                      }))
                    : [{ value: '', label: t`No Select field` }]
                }
                dropdownId={VIEW_PICKER_KANBAN_FIELD_DROPDOWN_ID}
              />
            </ViewPickerSelectContainer>
            {availableFieldsForKanban.length === 0 && (
              <StyledFieldAvailableContainer>
                <Trans>
                  Set up a Select field on {objectLabel} to create a Kanban
                </Trans>
              </StyledFieldAvailableContainer>
            )}
          </>
        )}
        {viewPickerType === ViewType.Calendar && (
          <>
            <ViewPickerSelectContainer>
              <Select
                label={t`Date field`}
                fullWidth
                value={viewPickerCalendarFieldMetadataId}
                onChange={(value) => {
                  setViewPickerIsDirty(true);
                  setViewPickerCalendarFieldMetadataId(value);
                }}
                options={
                  availableFieldsForCalendar.length > 0
                    ? availableFieldsForCalendar.map((field) => ({
                        value: field.id,
                        label: field.label,
                      }))
                    : [{ value: '', label: t`No Date field` }]
                }
                dropdownId={VIEW_PICKER_CALENDAR_FIELD_DROPDOWN_ID}
              />
            </ViewPickerSelectContainer>
            {availableFieldsForCalendar.length === 0 && (
              <StyledFieldAvailableContainer>
                <Trans>
                  Set up a Date field on {objectLabel} to create a Calendar
                </Trans>
              </StyledFieldAvailableContainer>
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <ViewPickerSaveButtonContainer>
          <ViewPickerCreateButton />
        </ViewPickerSaveButtonContainer>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
