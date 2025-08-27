import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type View } from '@/views/types/View';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';
import { Key } from 'ts-key-enum';
import { OverflowingTextWithTooltip, useIcons } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';

const StyledDropdownMenuIconAndNameContainer = styled.div`
  align-items: center;
  display: flex;
  margin-left: 0;
  margin-right: 0;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledMenuTitleContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledMenuIconContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(6)};
`;

const StyledMainText = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

type ObjectOptionsDropdownMenuViewNameProps = {
  currentView: View;
};

export const ObjectOptionsDropdownMenuViewName = ({
  currentView,
}: ObjectOptionsDropdownMenuViewNameProps) => {
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] =
    useRecoilComponentState(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useRecoilComponentValue(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetRecoilComponentState(
    viewPickerIsDirtyComponentState,
  );

  const { setAndPersistViewName, setAndPersistViewIcon } =
    useUpdateObjectViewOptions();

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();
  const [viewName, setViewName] = useState(currentView?.name);

  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: async () => {
      if (viewPickerIsPersisting) {
        return;
      }

      await updateViewFromCurrentState();
    },
    focusId: VIEW_PICKER_DROPDOWN_ID,
    dependencies: [viewPickerIsPersisting, updateViewFromCurrentState],
  });

  const handleIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
    setAndPersistViewIcon(iconKey, currentView);
  };

  const handleViewNameChange = useDebouncedCallback((value: string) => {
    setAndPersistViewName(value, currentView);
  }, 500);

  useEffect(() => {
    setViewPickerSelectedIcon(currentView.icon);
  }, [currentView.icon, setViewPickerSelectedIcon]);

  useEffect(() => {
    if (currentView?.key !== 'INDEX' && inputRef.current !== null) {
      inputRef.current.focus();
    }
  }, [currentView?.key]);

  const theme = useTheme();
  const { getIcon } = useIcons();
  const MainIcon = getIcon(currentView?.icon);

  return (
    <>
      {currentView?.key === 'INDEX' ? (
        <StyledMenuTitleContainer>
          <StyledMenuIconContainer>
            <MainIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          </StyledMenuIconContainer>
          <StyledMainText>
            <OverflowingTextWithTooltip text={currentView.name} />
          </StyledMainText>
        </StyledMenuTitleContainer>
      ) : (
        <DropdownMenuItemsContainer>
          <StyledDropdownMenuIconAndNameContainer>
            <IconPicker
              size="small"
              onChange={handleIconChange}
              selectedIconKey={viewPickerSelectedIcon}
            />
            <TextInput
              value={viewName}
              onChange={(value) => {
                setViewName(value);
                handleViewNameChange(value);
              }}
              autoGrow={false}
              sizeVariant="sm"
              fullWidth
            />
          </StyledDropdownMenuIconAndNameContainer>
        </DropdownMenuItemsContainer>
      )}
    </>
  );
};
