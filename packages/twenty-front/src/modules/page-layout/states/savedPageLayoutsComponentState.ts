import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type PageLayout } from '../types/PageLayout';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const savedPageLayoutsComponentState = createComponentState<
  PageLayout[]
>({
  key: 'savedPageLayoutsComponentState',
  defaultValue: [],
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
