import { getRecordIndexIdFromObjectNamePluralAndViewId } from '@/object-record/utils/getRecordIndexIdFromObjectNamePluralAndViewId';
import { isNonEmptyString } from '@sniptt/guards';

type GetRecordTableWidgetRecordIndexIdParams = {
  objectNamePlural: string;
  viewId: string;
  widgetId: string;
  instanceIdSuffix?: string;
};

export const getRecordTableWidgetRecordIndexId = ({
  objectNamePlural,
  viewId,
  widgetId,
  instanceIdSuffix,
}: GetRecordTableWidgetRecordIndexIdParams): string => {
  const recordIndexId = `${getRecordIndexIdFromObjectNamePluralAndViewId(
    objectNamePlural,
    viewId,
  )}-widget-${widgetId}`;

  return isNonEmptyString(instanceIdSuffix)
    ? `${recordIndexId}-${instanceIdSuffix}`
    : recordIndexId;
};
