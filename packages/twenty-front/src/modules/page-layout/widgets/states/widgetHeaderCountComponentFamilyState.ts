import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const widgetHeaderCountComponentFamilyState =
  createAtomComponentFamilyState<number | null, string>({
    key: 'widgetHeaderCountComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
