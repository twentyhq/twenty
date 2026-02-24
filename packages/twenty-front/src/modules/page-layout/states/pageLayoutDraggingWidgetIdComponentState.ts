import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraggingWidgetIdComponentState = createComponentState<
  string | null
>({
  key: 'pageLayoutDraggingWidgetIdComponentState',
  defaultValue: null,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
