import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutSelectedCellsComponentState = createAtomComponentState<
  Set<string>
>({
  key: 'pageLayoutSelectedCellsComponentState',
  defaultValue: new Set(),
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
