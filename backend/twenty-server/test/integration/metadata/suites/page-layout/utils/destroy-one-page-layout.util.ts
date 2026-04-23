import {
  type DestroyOnePageLayoutFactoryInput,
  destroyOnePageLayoutQueryFactory,
} from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const destroyOnePageLayout = async ({
  input,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<DestroyOnePageLayoutFactoryInput>): CommonResponseBody<{
  destroyPageLayout: boolean;
}> => {
  const graphqlOperation = destroyOnePageLayoutQueryFactory({
    input,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Page layout destroy should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Page layout destroy has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
