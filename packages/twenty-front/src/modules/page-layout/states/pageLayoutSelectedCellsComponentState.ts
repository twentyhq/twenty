import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutSelectedCellsComponentState = createComponentState<
  Set<string>
>({
  key: 'pageLayoutSelectedCellsComponentState',
  defaultValue: new Set(),
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
