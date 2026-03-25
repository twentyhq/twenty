import { type NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';

export const getNavigationSubItemLeftAdornment = ({
  index,
  arrayLength,
  selectedIndex,
}: {
  index: number;
  arrayLength: number;
  selectedIndex: number;
}): NavigationDrawerSubItemState => {
  const thereIsOnlyOneItem = arrayLength === 1;

  const itsTheLastItem = index === arrayLength - 1;

  const itsTheSelectedItem = index === selectedIndex;

  const itsBeforeTheSelectedItem = index < selectedIndex;

  if (thereIsOnlyOneItem || itsTheLastItem) {
    if (itsTheSelectedItem) {
      return 'last-selected';
    } else {
      return 'last-not-selected';
    }
  } else {
    if (itsTheSelectedItem) {
      return 'intermediate-selected';
    } else if (itsBeforeTheSelectedItem) {
      return 'intermediate-before-selected';
    } else {
      return 'intermediate-after-selected';
    }
  }
};
