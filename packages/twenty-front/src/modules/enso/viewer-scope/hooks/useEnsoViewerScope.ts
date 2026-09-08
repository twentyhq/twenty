import { useQuery } from '@apollo/client/react';

import { ENSO_VIEWER_SCOPE } from '@/enso/viewer-scope/graphql/queries/ensoViewerScope';

type EnsoViewerScopeData = {
  ensoViewerScope: {
    isRecordScoped: boolean;
    hiddenNavigationObjectNameSingulars: string[];
    defaultViews: { objectMetadataId: string; viewId: string }[];
  };
};

const EMPTY_HIDDEN_OBJECTS: string[] = [];
const EMPTY_DEFAULT_VIEWS: { objectMetadataId: string; viewId: string }[] = [];

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
    // objectMetadataId -> viewId for this viewer's role. Consulted by the view
    // resolver ahead of the workspace INDEX view.
    roleDefaultViewIdByObjectMetadataId: Object.fromEntries(
      (data?.ensoViewerScope.defaultViews ?? EMPTY_DEFAULT_VIEWS).map(
        (defaultView) => [defaultView.objectMetadataId, defaultView.viewId],
      ),
    ),
  };
};
