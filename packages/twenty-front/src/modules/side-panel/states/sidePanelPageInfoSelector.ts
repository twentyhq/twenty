import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type IconComponent } from 'twenty-ui/icon';

type SidePanelPageInfo = {
  title?: string;
  Icon?: IconComponent;
  instanceId: string;
};

export const sidePanelPageInfoSelector = createAtomSelector<SidePanelPageInfo>({
  key: 'side-panel/sidePanelPageInfoSelector',
  get: ({ get }) => {
    const currentNavigationItem = get(sidePanelNavigationStackState).at(-1);

    return {
      title: currentNavigationItem?.pageTitle,
      Icon: currentNavigationItem?.pageIcon,
      instanceId: currentNavigationItem?.pageId ?? '',
    };
  },
});
