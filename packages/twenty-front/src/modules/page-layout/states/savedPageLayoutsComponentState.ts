import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const savedPageLayoutsComponentState = createAtomComponentState<
  PageLayout[]
>({
  key: 'savedPageLayoutsComponentState',
  defaultValue: [],
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
