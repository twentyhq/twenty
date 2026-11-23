import { ListItemButton } from 'twenty-ui/components/navigation';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useLingui } from '@lingui/react/macro';
import { createPath, useLocation } from 'react-router-dom';
import {
  IconChevronLeft,
  IconCircle,
  IconCircleDashed,
  IconCopy,
} from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const WORKSPACE_ITEM_ID = 'workspace';
const PRIVATE_ITEM_ID = 'private';

export const ObjectOptionsDropdownVisibilityContent = () => {
  const { t } = useLingui();
  const location = useLocation();
  const { resetContent, dropdownId } = useObjectOptionsDropdown();
  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();
  const { copyToClipboard } = useCopyToClipboard();
  const hasViewsPermission = useHasPermissionFlag(PermissionFlagType.VIEWS);
  const { canPersistChanges } = useCanPersistViewChanges();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const selectableItemIdArray = [WORKSPACE_ITEM_ID, PRIVATE_ITEM_ID];

  const handleIsPrivateChange = (isPrivate: boolean) => {
    if (!canPersistChanges || !currentView) {
      return;
    }
    updateCurrentView({
      isPrivate,
    });
    resetContent();
  };

  const handleCopyLink = async () => {
    const canonicalViewUrl = new URL(
      createPath(location),
      window.location.origin,
    ).toString();
    await copyToClipboard(canonicalViewUrl, t`Link copied to clipboard`);
  };

  const isPrivate = currentView?.isPrivate ?? false;

  return (
    <LegacyDropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Visibility`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={WORKSPACE_ITEM_ID}
            onEnter={() =>
              hasViewsPermission &&
              canPersistChanges &&
              handleIsPrivateChange(false)
            }
          >
            <Tooltip
              content={t`Workspace views require manage views permission`}
              positionMethod="fixed"
              delay={TooltipDelay.mediumDelay}
              disabled={!!hasViewsPermission}
            >
              <div id="workspace-visibility-option">
                <ListItemButton
                  focused={selectedItemId === WORKSPACE_ITEM_ID}
                  onClick={() => handleIsPrivateChange(false)}
                  disabled={!hasViewsPermission || !canPersistChanges}
                  role="option"
                  aria-selected={!isPrivate}
                  selected={!isPrivate}
                  indicator="check"
                  description={t`Everyone`}
                  startIcon={<IconCircle />}
                >{t`Workspace`}</ListItemButton>
              </div>
            </Tooltip>
          </SelectableListItem>
          <SelectableListItem
            itemId={PRIVATE_ITEM_ID}
            onEnter={() => canPersistChanges && handleIsPrivateChange(true)}
          >
            <ListItemButton
              focused={selectedItemId === PRIVATE_ITEM_ID}
              onClick={() => handleIsPrivateChange(true)}
              disabled={!canPersistChanges}
              role="option"
              aria-selected={isPrivate}
              selected={isPrivate}
              indicator="check"
              description={t`Visible to you`}
              startIcon={<IconCircleDashed />}
            >{t`Unlisted`}</ListItemButton>
          </SelectableListItem>
          {!isPrivate && (
            <>
              <DropdownMenuSeparator />
              <SelectableListItem
                itemId="Copy view link"
                onEnter={handleCopyLink}
              >
                <ListItemButton
                  focused={selectedItemId === 'Copy view link'}
                  onClick={handleCopyLink}
                  startIcon={<IconCopy />}
                >{t`Copy view link`}</ListItemButton>
              </SelectableListItem>
            </>
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </LegacyDropdownContent>
  );
};
