import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Tab ids the user hovered with intent, most recent last. The tabs renderer
// keeps them mounted but hidden so opening one shows already-fetched content.
export const pageLayoutPrerenderedTabIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'pageLayoutPrerenderedTabIdsComponentState',
    defaultValue: [],
    componentInstanceContext: TabListComponentInstanceContext,
  });
