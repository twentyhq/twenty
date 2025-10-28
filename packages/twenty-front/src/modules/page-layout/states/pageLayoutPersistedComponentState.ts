import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { type PageLayout } from '@/page-layout/types/PageLayout';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutPersistedComponentState = createComponentState<
  PageLayout | undefined
>({
  key: 'pageLayoutPersistedComponentState',
  defaultValue: undefined,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
