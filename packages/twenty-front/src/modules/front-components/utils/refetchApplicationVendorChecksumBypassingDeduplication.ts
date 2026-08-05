import { type ApolloClient } from '@apollo/client';
import { GetApplicationVendorChecksumDocument } from '~/generated-metadata/graphql';

export const refetchApplicationVendorChecksumBypassingDeduplication = ({
  apolloClient,
  applicationId,
}: {
  apolloClient: ApolloClient;
  applicationId: string;
}) =>
  apolloClient.query({
    query: GetApplicationVendorChecksumDocument,
    variables: { applicationId },
    fetchPolicy: 'network-only',
    context: { queryDeduplication: false },
  });
