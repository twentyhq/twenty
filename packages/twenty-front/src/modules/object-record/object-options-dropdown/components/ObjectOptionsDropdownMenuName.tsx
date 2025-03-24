import { Key } from 'ts-key-enum';

import { useObjectOptions } from '@/object-record/object-options-dropdown/hooks/useObjectOptions';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { View } from '@/views/types/View';
import { ViewsHotkeyScope } from '@/views/types/ViewsHotkeyScope';
import { useUpdateViewFromCurrentState } from '@/views/view-picker/hooks/useUpdateViewFromCurrentState';
import { viewPickerIsDirtyComponentState } from '@/views/view-picker/states/viewPickerIsDirtyComponentState';
import { viewPickerIsPersistingComponentState } from '@/views/view-picker/states/viewPickerIsPersistingComponentState';
import { viewPickerSelectedIconComponentState } from '@/views/view-picker/states/viewPickerSelectedIconComponentState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from '@ui/display';
import { useState } from 'react';
import { useIcons } from 'twenty-ui';

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
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(6)};
`;
const StyledMainText = styled.div`
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

export const ObjectOptionsDropdownMenuName = ({
  currentView,
}: {
  currentView: View | undefined;
}) => {
  const [viewPickerSelectedIcon, setViewPickerSelectedIcon] =
    useRecoilComponentStateV2(viewPickerSelectedIconComponentState);

  const viewPickerIsPersisting = useRecoilComponentValueV2(
    viewPickerIsPersistingComponentState,
  );
  const setViewPickerIsDirty = useSetRecoilComponentStateV2(
    viewPickerIsDirtyComponentState,
  );

  const { setAndPersistViewName, setAndPersistViewIcon } = useObjectOptions();

  const { updateViewFromCurrentState } = useUpdateViewFromCurrentState();
  const [viewNameNotReactivelyUpdated, setViewNameNotReactivelyUpdated] =
    useState(currentView?.name);

  useScopedHotkeys(
    Key.Enter,
    async () => {
      if (viewPickerIsPersisting) {
        return;
      }

      await updateViewFromCurrentState();
    },
    ViewsHotkeyScope.ListDropdown,
  );

  const onIconChange = ({ iconKey }: { iconKey: string }) => {
    setViewPickerIsDirty(true);
    setViewPickerSelectedIcon(iconKey);
    setAndPersistViewIcon(iconKey, currentView);
  };
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
              onChange={onIconChange}
              selectedIconKey={viewPickerSelectedIcon}
            />
            <TextInputV2
              value={viewNameNotReactivelyUpdated}
              onChange={(value) => {
                setViewNameNotReactivelyUpdated(value);
                setAndPersistViewName(value, currentView);
              }}
              autoGrow={false}
              sizeVariant="sm"
            />
          </StyledDropdownMenuIconAndNameContainer>
        </DropdownMenuItemsContainer>
      )}
    </>
  );
};
