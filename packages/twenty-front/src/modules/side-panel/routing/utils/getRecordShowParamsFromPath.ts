import { matchPath, parsePath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// The panel stack still needs to know which of its routed entries is a record,
// because a record entry carries its own top bar, chip and expand behaviour.
export const getRecordShowParamsFromPath = (path: string) => {
  const match = matchPath(
    AppPath.RecordShowPage,
    parsePath(path).pathname ?? '',
  );

  const objectNameSingular = match?.params.objectNameSingular;
  const objectRecordId = match?.params.objectRecordId;

  if (!isDefined(objectNameSingular) || !isDefined(objectRecordId)) {
    return null;
  }

  return { objectNameSingular, objectRecordId };
};
