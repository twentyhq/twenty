import { type PageLayoutWithData } from '@/page-layout/types/pageLayoutTypes';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutPersistedComponentState = createComponentState<
  PageLayoutWithData | undefined
>({
  key: 'pageLayoutPersistedComponentState',
  defaultValue: undefined,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
