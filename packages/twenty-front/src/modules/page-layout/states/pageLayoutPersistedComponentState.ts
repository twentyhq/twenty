import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { type PageLayout } from '@/page-layout/types/PageLayout';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutPersistedComponentState = createAtomComponentState<
  PageLayout | undefined
>({
  key: 'pageLayoutPersistedComponentState',
  defaultValue: undefined,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
