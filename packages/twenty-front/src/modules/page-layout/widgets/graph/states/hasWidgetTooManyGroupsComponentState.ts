import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const hasWidgetTooManyGroupsComponentState =
  createComponentState<boolean>({
    key: 'hasWidgetTooManyGroupsComponentState',
    defaultValue: false,
    componentInstanceContext: WidgetComponentInstanceContext,
  });
