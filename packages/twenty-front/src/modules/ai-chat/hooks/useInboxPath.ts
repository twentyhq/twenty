import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { getInboxPath } from '@/ai-chat/utils/getInboxPath';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useInboxPath = () => {
  const inboxRecordRouteObjectNames = useAtomStateValue(
    inboxRecordRouteObjectNamesSelector,
  );
  const [searchParams] = useSearchParams();
  const viewId = searchParams.get('viewId');

  const getInboxThreadPath = useCallback(
    (threadId: string | null) =>
      getInboxPath({
        threadId,
        inboxRecordRouteObjectNames,
        queryParams:
          isDefined(inboxRecordRouteObjectNames) && isNonEmptyString(viewId)
            ? { viewId }
            : undefined,
      }),
    [inboxRecordRouteObjectNames, viewId],
  );

  return { getInboxThreadPath };
};
