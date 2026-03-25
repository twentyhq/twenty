import { computeRelationConnectInputTypeKey } from 'src/engine/api/graphql/workspace-schema-builder/utils/compute-stored-gql-type-key-utils/compute-relation-connect-input-type-key.util';

describe('computeRelationConnectInputTypeKey', () => {
  it('should return the correct relation connect input type key', () => {
    const objectMetadataNameId = '20202020-f401-4d8a-a731-64d007c27bad';

    const result = computeRelationConnectInputTypeKey(objectMetadataNameId);

    expect(result).toBe('20202020-f401-4d8a-a731-64d007c27bad-ConnectInput');
  });
});
