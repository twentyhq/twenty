import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutResizingWidgetIdComponentState = createComponentStateV2<
  string | null
>({
  key: 'pageLayoutResizingWidgetIdComponentState',
  defaultValue: null,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
