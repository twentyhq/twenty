import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { viewTypeIconMapping } from '@/views/types/ViewType';

export const useCommandMenuItemCurrentViewSectionContext = ():
  | CommandMenuItemSectionContext
  | undefined => {
  const { theme } = useContext(ThemeContext);

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  if (!isDefined(view)) {
    return undefined;
  }

  const ViewTypeIcon = viewTypeIconMapping(view.type);

  return {
    icon: <ViewTypeIcon size={theme.icon.size.md} />,
    label: view.name,
  };
};
