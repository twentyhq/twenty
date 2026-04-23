import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type InstallApplicationFactoryInput,
  installApplicationQueryFactory,
} from 'test/integration/metadata/suites/application/utils/install-application-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const installApplication = async ({
  input,
  expectToFail = false,
  token,
}: {
  input: InstallApplicationFactoryInput;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  installApplication: boolean;
}> => {
  const graphqlOperation = installApplicationQueryFactory({ input });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Install application should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Install application has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
