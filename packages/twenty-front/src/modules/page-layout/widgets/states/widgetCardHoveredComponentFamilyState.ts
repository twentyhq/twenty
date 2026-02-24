import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const widgetCardHoveredComponentFamilyState =
  createComponentFamilyStateV2<boolean, string>({
    key: 'widgetCardHoveredComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
