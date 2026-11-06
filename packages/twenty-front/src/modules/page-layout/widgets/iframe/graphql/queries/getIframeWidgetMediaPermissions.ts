import { gql } from '@apollo/client';

export const GET_IFRAME_WIDGET_MEDIA_PERMISSIONS = gql`
  query GetIframeWidgetMediaPermissions($id: String!) {
    getPageLayoutWidget(id: $id) {
      id
      applicationId
      applicationName
      applicationGrantedIframeMediaPermissions {
        origin
        microphone
        camera
      }
    }
  }
`;
