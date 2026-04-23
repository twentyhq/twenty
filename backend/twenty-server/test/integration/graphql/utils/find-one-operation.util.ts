import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';
import { type ObjectRecord } from 'twenty-shared/types';

type FindOneOperationArgs = Parameters<typeof findOneOperationFactory>[0] & {
  expectToFail?: boolean;
};
export const findOneOperation = async ({
  gqlFields = 'id',
  objectMetadataSingularName,
  expectToFail = false,
  filter,
}: FindOneOperationArgs): CommonResponseBody<{
  findResponse: ObjectRecord;
}> => {
  const graphqlOperation = findOneOperationFactory({
    objectMetadataSingularName,
    gqlFields,
    filter,
  });

  const response = await makeGraphqlAPIRequest(graphqlOperation);

  if (expectToFail) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Find one operation should have failed but did not',
    });
  }

  return {
    data: {
      findResponse: response.body.data[objectMetadataSingularName],
    },
    errors: response.body.errors,
  };
};
