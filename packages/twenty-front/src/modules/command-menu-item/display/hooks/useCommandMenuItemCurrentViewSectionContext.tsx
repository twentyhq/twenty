import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';

export const useCommandMenuItemCurrentViewSectionContext = ():
  | CommandMenuItemSectionContext
  | undefined => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  if (!isDefined(view)) {
    return undefined;
  }

  const ViewIcon = getIcon(view.icon);

  return {
    icon: <ViewIcon size={theme.icon.size.md} />,
    label: view.name,
  };
};
