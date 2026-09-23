import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { DEFAULT_VIEW_GROUP_LOAD_LIMIT } from 'twenty-shared/constants';

export const recordIndexGroupLoadLimitComponentState =
  createAtomComponentState<number>({
    key: 'recordIndexGroupLoadLimitComponentState',
    defaultValue: DEFAULT_VIEW_GROUP_LOAD_LIMIT,
    componentInstanceContext: ViewComponentInstanceContext,
  });
