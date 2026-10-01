import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

// Most recent last; kept mounted but hidden so opening one shows already-fetched content.
export const pageLayoutPrerenderedTabIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'pageLayoutPrerenderedTabIdsComponentState',
    defaultValue: [],
    componentInstanceContext: TabListComponentInstanceContext,
  });
