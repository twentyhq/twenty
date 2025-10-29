import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraggingWidgetIdComponentState = createComponentState<
  string | null
>({
  key: 'pageLayoutDraggingWidgetIdComponentState',
  defaultValue: null,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
