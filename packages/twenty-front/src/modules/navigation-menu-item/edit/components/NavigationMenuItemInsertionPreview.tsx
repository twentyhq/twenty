import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { navigationMenuItemInsertionPreviewState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionPreviewState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type NavigationMenuItemInsertionPreviewProps = {
  folderId: string | null;
  index: number;
  sectionId: NavigationSections;
};

const StyledPreview = styled.div`
  margin-bottom: ${themeCssVariables.betweenSiblingsGap};
`;

export const NavigationMenuItemInsertionPreview = ({
  folderId,
  index,
  sectionId,
}: NavigationMenuItemInsertionPreviewProps) => {
  const navigationMenuItemInsertionPreview = useAtomStateValue(
    navigationMenuItemInsertionPreviewState,
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
    <StyledPreview role="status" aria-label={t`Select a menu item`}>
      <NavigationDrawerItem
        label={t`Select a menu item`}
        Icon={getIcon('IconFold')}
        variant="placeholder"
        indentationLevel={folderId ? 2 : 1}
        subItemState={folderId ? 'intermediate-after-selected' : undefined}
      />
    </StyledPreview>
  );
};
