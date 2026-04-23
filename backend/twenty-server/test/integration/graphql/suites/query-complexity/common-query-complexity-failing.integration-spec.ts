import { TOO_MANY_RELATION_QUERY_GQL_FIELDS } from 'test/integration/graphql/suites/query-complexity/constants/tooManyRelationQueryGqlFields.constant';
import { TWO_NESTED_ONE_TO_MANY_QUERY_GQL_FIELDS } from 'test/integration/graphql/suites/query-complexity/constants/twoNestedOneToManyQueryGqlFields.constant';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { groupByOperationFactory } from 'test/integration/graphql/utils/group-by-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createConfigVariable } from 'test/integration/twenty-config/utils/create-config-variable.util';
import { deleteConfigVariable } from 'test/integration/twenty-config/utils/delete-config-variable.util';

describe('Query Complexity - Failing Scenarios', () => {
  beforeAll(async () => {
    await createConfigVariable({
      input: {
        key: 'COMMON_QUERY_COMPLEXITY_LIMIT',
        value: 10,
      },
    });
  });

  afterAll(async () => {
    await deleteConfigVariable({
      input: { key: 'COMMON_QUERY_COMPLEXITY_LIMIT' },
    }).catch(() => {});
  });

  it('should fail findMany query with two nested one to many relations', async () => {
    const findManyPeopleOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: TWO_NESTED_ONE_TO_MANY_QUERY_GQL_FIELDS,
      first: 200,
    });

    const response = await makeGraphqlAPIRequest(findManyPeopleOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatchSnapshot();
  });

  it('should fail findMany query with too many relation fields', async () => {
    const findManyPeopleOperation = findManyOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      gqlFields: TOO_MANY_RELATION_QUERY_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(findManyPeopleOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatchSnapshot();
  });

  it('should fail groupBy query with too many relation fields', async () => {
    const groupByOperation = groupByOperationFactory({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      groupBy: [{ city: true }],
      gqlFields: `edges { node { id company { id } } }`,
      limit: 11,
    });

    const response = await makeGraphqlAPIRequest(groupByOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toMatchSnapshot();
  });
});
