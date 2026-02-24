import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutSelectedCellsComponentState = createComponentStateV2<
  Set<string>
>({
  key: 'pageLayoutSelectedCellsComponentState',
  defaultValue: new Set(),
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
