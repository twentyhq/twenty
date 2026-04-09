import {
  type DeleteLogicFunctionFactoryInput,
  deleteLogicFunctionQueryFactory,
} from 'test/integration/metadata/suites/logic-function/utils/delete-logic-function-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

export const deleteLogicFunction = async ({
  input,
  expectToFail = false,
  token,
}: {
  input: DeleteLogicFunctionFactoryInput;
  expectToFail?: boolean;
  token?: string;
}): CommonResponseBody<{
  deleteOneLogicFunction: { id: string };
}> => {
  const graphqlOperation = deleteLogicFunctionQueryFactory({
    input,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Logic Function deletion should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Logic Function deletion has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
