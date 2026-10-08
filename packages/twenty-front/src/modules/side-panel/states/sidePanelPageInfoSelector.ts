import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { type ActiveSidePanelPage } from '@/side-panel/types/SidePanelPage';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/icon';

type SidePanelPageInfo = {
  page: ActiveSidePanelPage;
  title?: string;
  Icon?: IconComponent;
  instanceId: string;
};

export const sidePanelPageInfoSelector = createAtomSelector<SidePanelPageInfo>({
  key: 'side-panel/sidePanelPageInfoSelector',
  get: ({ get }) => {
    const currentNavigationItem = get(sidePanelNavigationStackState).at(-1);

    return {
      page: currentNavigationItem?.page ?? SidePanelPages.CommandMenuDisplay,
      title: currentNavigationItem?.pageTitle,
      Icon: currentNavigationItem?.pageIcon,
      instanceId: currentNavigationItem?.pageId ?? '',
    };
  },
});
