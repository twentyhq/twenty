import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const viewPickerVisibilityComponentState =
  createComponentState<ViewVisibility>({
    key: 'viewPickerVisibilityComponentState',
    defaultValue: ViewVisibility.UNLISTED,
    componentInstanceContext: ViewComponentInstanceContext,
  });
