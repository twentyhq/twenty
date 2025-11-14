import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const widgetCardHoveredComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'widgetCardHoveredComponentFamilyState',
  defaultValue: false,
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
