import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateViewQueryFactory } from 'test/integration/metadata/suites/view/utils/update-view-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';
import { type UpdateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/update-view.input';

export const updateOneView = async ({
  viewId,
  input,
  gqlFields,
  expectToFail,
}: {
  viewId: string;
  input: UpdateViewInput;
  gqlFields?: string;
  expectToFail?: boolean;
}): CommonResponseBody<{
  updateView: ViewDTO;
}> => {
  const graphqlOperation = updateViewQueryFactory({
    viewId,
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'View update should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'View update has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
