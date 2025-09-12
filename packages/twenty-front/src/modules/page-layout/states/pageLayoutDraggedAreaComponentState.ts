import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { type PageLayoutDraggedArea } from '@/page-layout/types/page-layout-dragged-area';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraggedAreaComponentState =
  createComponentState<PageLayoutDraggedArea>({
    key: 'pageLayoutDraggedAreaComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
