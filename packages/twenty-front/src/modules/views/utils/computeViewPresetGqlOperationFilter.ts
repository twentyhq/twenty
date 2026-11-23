import { type View } from '@/views/types/View';
import { computeViewPresetFilterGqlFilter } from 'twenty-shared/ai';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const computeViewPresetGqlOperationFilter = ({
  view,
  currentWorkspaceMemberId,
}: {
  view: Pick<View, 'presetFilter'> | undefined;
  currentWorkspaceMemberId: string | undefined;
}): RecordGqlOperationFilter | undefined =>
  isDefined(view?.presetFilter)
    ? computeViewPresetFilterGqlFilter({
        presetFilter: view.presetFilter,
        currentWorkspaceMemberId,
      })
    : undefined;
