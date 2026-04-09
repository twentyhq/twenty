import { isNonEmptyString } from '@sniptt/guards';

import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { type SidePanelSubPageEntry } from '@/side-panel/types/SidePanelSubPageEntry';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';

export const sidePanelSubPageStackForActiveSidePanelPageSelector =
  createAtomSelector<SidePanelSubPageEntry[]>({
    key: 'sidePanelSubPageStackForActiveSidePanelPage',
    get: ({ get }) => {
      const pageInfo = get(sidePanelPageInfoState);

      if (!isNonEmptyString(pageInfo.instanceId)) {
        return [];
      }

      return get(sidePanelSubPageStackComponentState, {
        instanceId: pageInfo.instanceId,
      });
    },
  });
