import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { upsertFieldsWidgetQueryFactory } from 'test/integration/metadata/suites/view-field-group/utils/upsert-fields-widget-query-factory.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type UpsertFieldsWidgetInput } from 'src/engine/metadata-modules/view-field-group/dtos/inputs/upsert-fields-widget.input';
import { type ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';

export const upsertFieldsWidget = async ({
  input,
  gqlFields,
  expectToFail,
}: {
  input: UpsertFieldsWidgetInput;
  gqlFields?: string;
  expectToFail?: boolean | null;
}): CommonResponseBody<{
  upsertFieldsWidget: ViewDTO;
}> => {
  const graphqlOperation = upsertFieldsWidgetQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Upsert fields widget should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Upsert fields widget has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
