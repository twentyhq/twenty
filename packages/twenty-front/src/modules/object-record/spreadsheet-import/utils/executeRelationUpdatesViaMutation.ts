import { type ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { type RelationUpdateEntry } from '@/object-record/spreadsheet-import/utils/extractRelationUpdatesFromImportedRows';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/utils/getCreateManyRecordsMutationResponseField';
import { capitalize } from 'twenty-shared/utils';

export const executeRelationUpdatesViaMutation = async ({
  apolloClient,
  relationUpdates,
  batchSize,
}: {
  apolloClient: ApolloClient<object>;
  relationUpdates: RelationUpdateEntry[];
  batchSize: number;
}) => {
  for (const { targetObjectMetadataItem, updateRecords } of relationUpdates) {
    const mutationResponseField = getCreateManyRecordsMutationResponseField(
      targetObjectMetadataItem.namePlural,
    );

    const mutation = gql`
      mutation Create${capitalize(targetObjectMetadataItem.namePlural)}($data: [${capitalize(targetObjectMetadataItem.nameSingular)}CreateInput!]!, $upsert: Boolean) {
        ${mutationResponseField}(data: $data, upsert: $upsert) {
          id
        }
      }
    `;

    const numberOfBatches = Math.ceil(updateRecords.length / batchSize);

    for (let batchIndex = 0; batchIndex < numberOfBatches; batchIndex++) {
      const batch = updateRecords.slice(
        batchIndex * batchSize,
        (batchIndex + 1) * batchSize,
      );

      await apolloClient.mutate({
        mutation,
        variables: {
          data: batch,
          upsert: true,
        },
      });
    }
  }
};
