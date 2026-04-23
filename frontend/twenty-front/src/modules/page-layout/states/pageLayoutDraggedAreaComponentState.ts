import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { type PageLayoutDraggedArea } from '@/page-layout/types/page-layout-dragged-area';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraggedAreaComponentState =
  createAtomComponentState<PageLayoutDraggedArea>({
    key: 'pageLayoutDraggedAreaComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
