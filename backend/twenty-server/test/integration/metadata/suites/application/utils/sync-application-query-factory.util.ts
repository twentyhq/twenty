import gql from 'graphql-tag';
import { type Manifest } from 'twenty-shared/application';

export const syncApplicationQueryFactory = ({
  manifest,
}: {
  manifest: Manifest;
}) => ({
  query: gql`
    mutation SyncApplication($manifest: JSON!) {
      syncApplication(manifest: $manifest) {
        applicationUniversalIdentifier
        actions
      }
    }
  `,
  variables: {
    manifest,
  },
});
