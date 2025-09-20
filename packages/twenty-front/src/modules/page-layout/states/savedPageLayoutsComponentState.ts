import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type PageLayoutWithData } from '../types/pageLayoutTypes';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const savedPageLayoutsComponentState = createComponentState<
  PageLayoutWithData[]
>({
  key: 'savedPageLayoutsComponentState',
  defaultValue: [],
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
