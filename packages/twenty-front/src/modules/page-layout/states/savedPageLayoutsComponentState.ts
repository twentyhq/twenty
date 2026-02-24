import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { type PageLayout } from '@/page-layout/types/PageLayout';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const savedPageLayoutsComponentState = createComponentStateV2<
  PageLayout[]
>({
  key: 'savedPageLayoutsComponentState',
  defaultValue: [],
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
