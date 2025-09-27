import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const isPageLayoutDraggingTabComponentState =
  createComponentState<boolean>({
    key: 'isPageLayoutDraggingTabComponentState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
