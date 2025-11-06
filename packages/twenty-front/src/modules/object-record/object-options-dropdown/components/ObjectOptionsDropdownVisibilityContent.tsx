import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateCurrentView } from '@/views/hooks/useUpdateCurrentView';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { createPortal } from 'react-dom';
import {
  AppTooltip,
  IconChevronLeft,
  IconCircle,
  IconCircleDashed,
  IconCopy,
} from 'twenty-ui/display';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { PermissionFlagType } from '~/generated/graphql';

export const ObjectOptionsDropdownVisibilityContent = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { resetContent } = useObjectOptionsDropdown();
  const { currentView } = useGetCurrentViewOnly();
  const { updateCurrentView } = useUpdateCurrentView();
  const { enqueueSuccessSnackBar } = useSnackBar();
  const hasViewsPermission = useHasPermissionFlag(PermissionFlagType.VIEWS);
  const { canPersistChanges } = useCanPersistViewChanges();

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const selectableItemIdArray = [
    ViewVisibility.WORKSPACE,
    ViewVisibility.UNLISTED,
  ];

  const handleVisibilityChange = (visibility: ViewVisibility) => {
    if (!canPersistChanges || !currentView) return;
    updateCurrentView({
      visibility,
    });
    resetContent();
  };

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    enqueueSuccessSnackBar({
      message: t`Link copied to clipboard`,
      options: {
        icon: <IconCopy size={theme.icon.size.md} />,
        duration: 2000,
      },
    });
  };

  const currentVisibility = currentView?.visibility ?? ViewVisibility.WORKSPACE;

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Large}>
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
          selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
          focusId={OBJECT_OPTIONS_DROPDOWN_ID}
          selectableItemIdArray={selectableItemIdArray}
        >
          <SelectableListItem
            itemId={ViewVisibility.WORKSPACE}
            onEnter={() =>
              hasViewsPermission &&
              canPersistChanges &&
              handleVisibilityChange(ViewVisibility.WORKSPACE)
            }
          >
            <>
              <div id="workspace-visibility-option">
                <MenuItemSelect
                  LeftIcon={IconCircle}
                  text={t`Workspace`}
                  contextualText={t`Everyone`}
                  selected={currentVisibility === ViewVisibility.WORKSPACE}
                  focused={selectedItemId === ViewVisibility.WORKSPACE}
                  onClick={() =>
                    handleVisibilityChange(ViewVisibility.WORKSPACE)
                  }
                  disabled={!hasViewsPermission || !canPersistChanges}
                />
              </div>
              {!hasViewsPermission &&
                createPortal(
                  <AppTooltip
                    anchorSelect="#workspace-visibility-option"
                    content={t`Workspace views require manage views permission`}
                    positionStrategy="fixed"
                  />,
                  document.body,
                )}
            </>
          </SelectableListItem>
          <SelectableListItem
            itemId={ViewVisibility.UNLISTED}
            onEnter={() =>
              canPersistChanges &&
              handleVisibilityChange(ViewVisibility.UNLISTED)
            }
          >
            <MenuItemSelect
              LeftIcon={IconCircleDashed}
              text={t`Unlisted`}
              contextualText={t`Visible to you`}
              selected={currentVisibility === ViewVisibility.UNLISTED}
              focused={selectedItemId === ViewVisibility.UNLISTED}
              onClick={() => handleVisibilityChange(ViewVisibility.UNLISTED)}
              disabled={!canPersistChanges}
            />
          </SelectableListItem>
          {currentVisibility === ViewVisibility.WORKSPACE && (
            <>
              <DropdownMenuSeparator />
              <SelectableListItem
                itemId="Copy view link"
                onEnter={handleCopyLink}
              >
                <MenuItem
                  focused={selectedItemId === 'Copy view link'}
                  onClick={handleCopyLink}
                  LeftIcon={IconCopy}
                  text={t`Copy view link`}
                />
              </SelectableListItem>
            </>
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
