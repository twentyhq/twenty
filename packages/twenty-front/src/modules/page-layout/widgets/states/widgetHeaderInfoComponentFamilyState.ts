import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type WidgetHeaderInfo } from '@/page-layout/widgets/types/WidgetHeaderInfo';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const widgetHeaderInfoComponentFamilyState =
  createAtomComponentFamilyState<WidgetHeaderInfo | null, string>({
    key: 'widgetHeaderInfoComponentFamilyState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
