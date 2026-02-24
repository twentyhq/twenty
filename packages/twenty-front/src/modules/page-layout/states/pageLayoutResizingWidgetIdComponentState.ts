import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutResizingWidgetIdComponentState = createComponentState<
  string | null
>({
  key: 'pageLayoutResizingWidgetIdComponentState',
  defaultValue: null,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
