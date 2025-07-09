import { Key } from 'ts-key-enum';

import { useUpdateObjectViewOptions } from '@/object-record/object-options-dropdown/hooks/useUpdateObjectViewOptions';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { View } from '@/views/types/View';
import { VIEW_PICKER_DROPDOWN_ID } from '@/views/view-picker/constants/ViewPickerDropdownId';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
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
    useRecoilComponentStateV2(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetRecoilComponentStateV2(
    viewPickerIsDirtyComponentState,
  );

  const { setAndPersistViewName, setAndPersistViewIcon } =
    useUpdateObjectViewOptions();

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();
  const [viewName, setViewName] = useState(currentView?.name);

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

  const theme = useTheme();
  const { getIcon } = useIcons();
  const MainIcon = getIcon(currentView?.icon);

  return (
    <>
      {currentView?.key === 'INDEX' && (
        <StyledMenuTitleContainer>
          <StyledMenuIconContainer>
            <MainIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
          </StyledMenuIconContainer>
          <StyledMainText>
            <OverflowingTextWithTooltip text={currentView?.name} />
          </StyledMainText>
        </StyledMenuTitleContainer>
      )}
      {currentView?.key !== 'INDEX' && (
        <DropdownMenuItemsContainer>
          <StyledDropdownMenuIconAndNameContainer>
            <IconPicker
              size="small"
              onChange={handleIconChange}
              selectedIconKey={viewPickerSelectedIcon}
            />
            <TextInputV2
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
