import gql from 'graphql-tag';

// Whether this viewer only sees the records they own, and which objects to
// leave out of their sidebar. The list is served rather than hardcoded here so
// it has one home (the server constant).
export const ENSO_VIEWER_SCOPE = gql`
  query EnsoViewerScope {
    ensoViewerScope {
      isRecordScoped
      hiddenNavigationObjectNameSingulars
      defaultViews {
        objectMetadataId
        viewId
      }
    }
  }
`;
