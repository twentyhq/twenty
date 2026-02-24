import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const viewPickerVisibilityComponentState =
  createComponentStateV2<ViewVisibility>({
    key: 'viewPickerVisibilityComponentState',
    defaultValue: ViewVisibility.UNLISTED,
    componentInstanceContext: ViewComponentInstanceContext,
  });
