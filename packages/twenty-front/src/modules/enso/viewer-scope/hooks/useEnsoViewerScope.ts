import { useQuery } from '@apollo/client/react';

import { ENSO_VIEWER_SCOPE } from '@/enso/viewer-scope/graphql/queries/ensoViewerScope';

type EnsoViewerScopeData = {
  ensoViewerScope: {
    isRecordScoped: boolean;
    hiddenNavigationObjectNameSingulars: string[];
  };
};

const EMPTY_HIDDEN_OBJECTS: string[] = [];

// Cached for the session: a viewer's role does not change under them, and the
// sidebar renders on every page.
export const useEnsoViewerScope = () => {
  const { data } = useQuery<EnsoViewerScopeData>(ENSO_VIEWER_SCOPE, {
    fetchPolicy: 'cache-first',
  });

  return {
    isRecordScoped: data?.ensoViewerScope.isRecordScoped ?? false,
    hiddenNavigationObjectNameSingulars:
      data?.ensoViewerScope.hiddenNavigationObjectNameSingulars ??
      EMPTY_HIDDEN_OBJECTS,
  };
};
