import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutDraggingWidgetIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'pageLayoutDraggingWidgetIdComponentState',
  defaultValue: null,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
