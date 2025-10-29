import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutEditingTabIdComponentState = createComponentState<
  string | null
>({
  key: 'pageLayoutEditingTabIdComponentState',
  defaultValue: null,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
