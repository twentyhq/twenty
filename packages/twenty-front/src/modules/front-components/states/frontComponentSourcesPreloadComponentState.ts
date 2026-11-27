import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { type FrontComponentSourcesPreload } from '@/front-components/types/FrontComponentSourcesPreload';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const frontComponentSourcesPreloadComponentState =
  createAtomComponentState<FrontComponentSourcesPreload | null>({
    key: 'frontComponentSourcesPreloadComponentState',
    defaultValue: null,
    componentInstanceContext: FrontComponentInstanceContext,
  });
