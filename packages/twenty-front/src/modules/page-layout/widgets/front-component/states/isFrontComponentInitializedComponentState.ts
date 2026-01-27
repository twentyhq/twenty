import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { FrontComponentInstanceContext } from '@/page-layout/widgets/front-component/states/contexts/FrontComponentInstanceContext';

export const isFrontComponentInitializedComponentState =
  createComponentState<boolean>({
    key: 'isFrontComponentInitializedComponentState',
    defaultValue: false,
    componentInstanceContext: FrontComponentInstanceContext,
  });
