import { isDefined } from 'twenty-shared/utils';
import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';
import { useCallback } from 'react';
import { navigationMenuItemInsertionAnchorState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionAnchorState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { navigationMenuItemInsertionPreviewState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionPreviewState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

type NavigationMenuItemInsertionPreviewProps = {
  folderId: string | null;
  index: number;
  sectionId: NavigationSections;
  subItemState?: NavigationDrawerSubItemState;
};

const StyledPreview = styled.div<{ isInFolder: boolean }>`
  margin-bottom: ${({ isInFolder }) =>
    isInFolder ? 0 : themeCssVariables.betweenSiblingsGap};
`;

export const NavigationMenuItemInsertionPreview = ({
  folderId,
  index,
  sectionId,
  subItemState,
}: NavigationMenuItemInsertionPreviewProps) => {
  const navigationMenuItemInsertionPreview = useAtomStateValue(
    navigationMenuItemInsertionPreviewState,
  );
  const setNavigationMenuItemInsertionAnchor = useSetAtomState(
    navigationMenuItemInsertionAnchorState,
  );
  const dropdownId = navigationMenuItemInsertionPreview?.dropdownId;
  const setAnchor = useCallback(
    (element: HTMLDivElement | null) => {
      if (!isDefined(dropdownId)) {
        return;
      }
      const button = element?.querySelector('button');
      setNavigationMenuItemInsertionAnchor((anchor) => {
        if (isDefined(button)) {
          return { dropdownId, element: button };
        }
        return anchor?.dropdownId === dropdownId ? null : anchor;
      });
    },
    [dropdownId, setNavigationMenuItemInsertionAnchor],
  );
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const section =
    sectionId === NavigationSections.WORKSPACE ? 'workspace' : 'favorite';

  if (
    navigationMenuItemInsertionPreview?.section !== section ||
    navigationMenuItemInsertionPreview.folderId !== folderId ||
    navigationMenuItemInsertionPreview.index !== index
  ) {
    return null;
  }

  return (
    <StyledPreview
      ref={setAnchor}
      isInFolder={isDefined(folderId)}
      role="status"
      aria-label={t`Select a menu item`}
    >
      <NavigationDrawerItem
        label={t`Select a menu item`}
        Icon={getIcon('IconFold')}
        variant="placeholder"
        indentationLevel={isDefined(folderId) ? 2 : 1}
        subItemState={subItemState}
      />
    </StyledPreview>
  );
};
