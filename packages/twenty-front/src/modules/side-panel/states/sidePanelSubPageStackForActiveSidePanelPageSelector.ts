import { isNonEmptyString } from '@sniptt/guards';

import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { type SidePanelSubPageEntry } from '@/side-panel/types/SidePanelSubPageEntry';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

export const sidePanelSubPageStackForActiveSidePanelPageSelector =
  createAtomSelector<SidePanelSubPageEntry[]>({
    key: 'sidePanelSubPageStackForActiveSidePanelPage',
    get: ({ get }) => {
      const pageInfo = get(sidePanelPageInfoSelector);

      if (!isNonEmptyString(pageInfo.instanceId)) {
        return [];
      }

      return get(sidePanelSubPageStackComponentState, {
        instanceId: pageInfo.instanceId,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      });
    },
  });
