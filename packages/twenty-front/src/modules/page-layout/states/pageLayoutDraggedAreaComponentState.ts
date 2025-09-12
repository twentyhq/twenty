import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

type DraggedArea = {
  x: number;
  y: number;
  w: number;
  h: number;
} | null;

export const pageLayoutDraggedAreaComponentState =
  createComponentState<DraggedArea>({
    key: 'pageLayoutDraggedAreaComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
