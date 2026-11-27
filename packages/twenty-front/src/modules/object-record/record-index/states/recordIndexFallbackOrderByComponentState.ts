import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

export const recordIndexFallbackOrderByComponentState =
  createAtomComponentState<RecordGqlOperationOrderBy>({
    key: 'recordIndexFallbackOrderByComponentState',
    defaultValue: [],
    componentInstanceContext: ViewComponentInstanceContext,
  });
