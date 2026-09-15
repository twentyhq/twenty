import { gql } from '@apollo/client';

export const CREATE_RECORD_EXPORT_DOWNLOAD_URL = gql`
  mutation CreateRecordExportDownloadUrl($id: UUID!) {
    createRecordExportDownloadUrl(id: $id)
  }
`;
