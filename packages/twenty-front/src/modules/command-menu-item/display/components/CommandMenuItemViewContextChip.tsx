import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

import { CommandMenuItemSectionContextChip } from '@/command-menu-item/display/components/CommandMenuItemSectionContextChip';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { viewTypeIconMapping } from '@/views/types/ViewType';

export const CommandMenuItemViewContextChip = () => {
  const { theme } = useContext(ThemeContext);

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  if (!isDefined(view)) {
    return null;
  }

  const ViewTypeIcon = viewTypeIconMapping(view.type);

  return (
    <CommandMenuItemSectionContextChip
      startElement={<ViewTypeIcon size={theme.icon.size.sm} />}
      label={view.name}
    />
  );
};
