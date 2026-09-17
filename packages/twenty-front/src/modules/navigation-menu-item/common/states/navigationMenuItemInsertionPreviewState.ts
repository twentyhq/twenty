import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const navigationMenuItemInsertionPreviewState = createAtomState<{
  dropdownId: string;
  section: NavigationMenuItemSection;
  folderId: string | null;
  index: number;
} | null>({
  key: 'navigationMenuItemInsertionPreviewState',
  defaultValue: null,
});
