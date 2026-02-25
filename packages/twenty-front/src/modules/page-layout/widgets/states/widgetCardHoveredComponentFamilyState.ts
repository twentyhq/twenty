import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const widgetCardHoveredComponentFamilyState =
  createAtomComponentFamilyState<boolean, string>({
    key: 'widgetCardHoveredComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
