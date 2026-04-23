import {
  type FindManyFieldsMetadataFactoryInput,
  findManyFieldsMetadataQueryFactory,
} from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const findManyFieldsMetadata = async ({
  input,
  gqlFields,
  expectToFail,
}: PerformMetadataQueryParams<FindManyFieldsMetadataFactoryInput>) => {
  const graphqlOperation = findManyFieldsMetadataQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata retrieval should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      errorMessage: 'Field metadata retrieval should not have failed',
      response,
    });
  }

  return {
    errors: response.body.errors,
    fields: response.body.data.fields?.edges,
  };
};
