import { ObjectOptionsDropdownMenuContentCustom } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownCreateCustomViewContent';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { type ViewKey } from '@/views/types/ViewKey';
import { type ViewType } from '@/views/types/ViewType';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  IconCopy,
  IconLayout,
  IconListDetails,
  IconLock,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

interface CurrentView {
  id: string;
  name: string | null;
  icon: string;
  type: ViewType;
  key: ViewKey | null;
  viewGroups?: any[];
}

interface DefaultViewHeaderProps {
  currentView: CurrentView;
}

const DefaultViewHeader = ({ currentView }: DefaultViewHeaderProps) => {
  const { getIcon } = useIcons();
  const MainIcon = getIcon(currentView?.icon);

  return (
    <DropdownMenuItemsContainer scrollable={false}>
      <MenuItem
        text={t`Default View`}
        LeftIcon={MainIcon}
        RightIcon={IconLock}
        disabled={true}
      />
    </DropdownMenuItemsContainer>
  );
};

export const ObjectOptionsDropdownMenuContent = () => {
  const { t } = useLingui();
  const { recordIndexId, objectMetadataItem, onContentChange } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();
  const [showCustomView, setShowCustomView] = useState(false);

  const { visibleBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const selectableItemIdArray = [
    'Fields',
    'Copy link to view',
    'Create custom view',
  ];

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const handleCreateCustomView = () => {
    setShowCustomView(true);
  };

  const { copyToClipboard } = useCopyToClipboard();

  if (showCustomView) {
    return (
      <ObjectOptionsDropdownMenuContentCustom
        onBackToDefault={() => setShowCustomView(false)}
      />
    );
  }

  return (
    <DropdownContent>
      {currentView && <DefaultViewHeader currentView={currentView} />}
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
        focusId={OBJECT_OPTIONS_DROPDOWN_ID}
        selectableItemIdArray={selectableItemIdArray}
      >
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Fields"
            onEnter={() => onContentChange('fields')}
          >
            <MenuItem
              focused={selectedItemId === 'Fields'}
              onClick={() => onContentChange('fields')}
              LeftIcon={IconListDetails}
              text={t`Fields`}
              contextualText={`${visibleBoardFields.length} shown`}
              hasSubMenu
            />
          </SelectableListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Copy link to view"
            onEnter={() => {
              const currentUrl = window.location.href;
              copyToClipboard(currentUrl, t`Link copied to clipboard`);
            }}
          >
            <MenuItem
              focused={selectedItemId === 'Copy link to view'}
              onClick={() => {
                const currentUrl = window.location.href;
                copyToClipboard(currentUrl, t`Link copied to clipboard`);
              }}
              LeftIcon={IconCopy}
              text={t`Copy link to view`}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="Create custom view"
            onEnter={handleCreateCustomView}
          >
            <MenuItem
              focused={selectedItemId === 'Create custom view'}
              onClick={handleCreateCustomView}
              LeftIcon={IconLayout}
              text={t`Create custom view`}
            />
          </SelectableListItem>
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
