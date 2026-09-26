import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useIsNavigationMenuItemEditHighlighted } from '@/navigation-menu-item/display/hooks/useIsNavigationMenuItemEditHighlighted';
import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Offsets inside the 1px border that line up with NavigationDrawerItemBreadcrumb
// (item border + padding + breadcrumb margin) and with the sub item icon.
const FOLDER_TREE_LINE_LEFT = '11.5px';
const FOLDER_CONTENT_PADDING_LEFT = '28.5px';

const StyledDivider = styled.div<{
  $isEditable: boolean;
  $isSelectedInEditMode: boolean;
  $isInFolder: boolean;
}>`
  align-items: center;
  border: 1px solid
    ${({ $isSelectedInEditMode }) =>
      $isSelectedInEditMode ? themeCssVariables.color.blue : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: ${({ $isEditable }) => ($isEditable ? 'pointer' : 'default')};
  display: flex;
  /* Folder content is a flex column that is shorter than its children while
     it animates open or closed; an empty divider would shrink to nothing. */
  flex-shrink: 0;
  height: ${({ $isEditable }) =>
    $isEditable ? themeCssVariables.spacing[5] : themeCssVariables.spacing[3]};
  padding-left: ${({ $isInFolder }) =>
    $isInFolder ? FOLDER_CONTENT_PADDING_LEFT : themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  position: relative;

  &:hover {
    background-color: ${({ $isEditable }) =>
      $isEditable
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  }
`;

const StyledDividerLine = styled.div`
  background-color: ${themeCssVariables.border.color.strong};
  flex: 1;
  height: 1px;
`;

const StyledFolderTreeLine = styled.div<{ $isBeforeSelected: boolean }>`
  background: ${({ $isBeforeSelected }) =>
    $isBeforeSelected
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.border.color.strong};
  bottom: -1px;
  left: ${FOLDER_TREE_LINE_LEFT};
  position: absolute;
  top: -1px;
  width: 1px;
`;

type NavigationMenuItemDividerDisplayProps = {
  item: Pick<NavigationMenuItem, 'id' | 'folderId'>;
  onEditModeClick?: () => void;
  subItemState?: NavigationDrawerSubItemState;
};

// Outside layout customization a divider is plain whitespace; in it, a
// visible line that can be selected and dragged like any other item.
export const NavigationMenuItemDividerDisplay = ({
  item,
  onEditModeClick,
  subItemState,
}: NavigationMenuItemDividerDisplayProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isSelectedInEditMode = useIsNavigationMenuItemEditHighlighted(item);

  const isInFolder = isDefined(subItemState);
  const isFolderTreeLineVisible =
    isInFolder &&
    subItemState !== 'last-selected' &&
    subItemState !== 'last-not-selected';

  return (
    <StyledDivider
      role="separator"
      $isEditable={isLayoutCustomizationModeEnabled}
      $isSelectedInEditMode={
        isLayoutCustomizationModeEnabled && isSelectedInEditMode
      }
      $isInFolder={isInFolder}
      onClick={
        isLayoutCustomizationModeEnabled
          ? (event) => {
              event.stopPropagation();
              onEditModeClick?.();
            }
          : undefined
      }
    >
      {isFolderTreeLineVisible && (
        <StyledFolderTreeLine
          $isBeforeSelected={subItemState === 'intermediate-before-selected'}
        />
      )}
      {isLayoutCustomizationModeEnabled && <StyledDividerLine />}
    </StyledDivider>
  );
};
