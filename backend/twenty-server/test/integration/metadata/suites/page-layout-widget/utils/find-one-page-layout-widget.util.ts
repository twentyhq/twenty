import {
  type FindOnePageLayoutWidgetFactoryInput,
  findOnePageLayoutWidgetQueryFactory,
} from 'test/integration/metadata/suites/page-layout-widget/utils/find-one-page-layout-widget-query-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type CommonResponseBody } from 'test/integration/metadata/types/common-response-body.type';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

import { type PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';

export const findOnePageLayoutWidget = async ({
  input,
  gqlFields,
  expectToFail = false,
  token,
}: PerformMetadataQueryParams<FindOnePageLayoutWidgetFactoryInput>): CommonResponseBody<{
  getPageLayoutWidget: PageLayoutWidgetDTO;
}> => {
  const graphqlOperation = findOnePageLayoutWidgetQueryFactory({
    input,
    gqlFields,
  });

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Find page layout widget should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      response,
      errorMessage: 'Find page layout widget has failed but should not',
    });
  }

  return { data: response.body.data, errors: response.body.errors };
};
