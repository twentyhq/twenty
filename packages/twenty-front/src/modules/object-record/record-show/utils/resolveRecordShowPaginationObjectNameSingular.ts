import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const resolveRecordShowPaginationObjectNameSingular = ({
  propsOrParamObjectNameSingular,
  parentViewObjectNameSingular,
}: {
  propsOrParamObjectNameSingular: string;
  parentViewObjectNameSingular?: string | null;
}): string => {
  const shouldUseParentViewObjectForPagination =
    isDefined(parentViewObjectNameSingular) &&
    parentViewObjectNameSingular !== propsOrParamObjectNameSingular &&
    propsOrParamObjectNameSingular === CoreObjectNameSingular.Dashboard;

  return shouldUseParentViewObjectForPagination
    ? parentViewObjectNameSingular
    : propsOrParamObjectNameSingular;
};
