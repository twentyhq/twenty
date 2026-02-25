import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewVisibility } from '~/generated-metadata/graphql';

export const viewPickerVisibilityComponentState =
  createAtomComponentState<ViewVisibility>({
    key: 'viewPickerVisibilityComponentState',
    defaultValue: ViewVisibility.UNLISTED,
    componentInstanceContext: ViewComponentInstanceContext,
  });
