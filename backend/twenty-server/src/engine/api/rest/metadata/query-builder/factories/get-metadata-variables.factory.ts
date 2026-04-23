import { BadRequestException, Injectable } from '@nestjs/common';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import { MetadataQueryVariables } from 'src/engine/api/rest/metadata/types/metadata-query-variables.type';
import { RequestContext } from 'src/engine/api/rest/types/RequestContext';

@Injectable()
export class GetMetadataVariablesFactory {
  create(
    id: string | undefined,
    requestContext: RequestContext,
  ): MetadataQueryVariables {
    if (id) {
      return { id };
    }

    const limit = parseLimitRestRequest(requestContext, 1000);
    const before = parseEndingBeforeRestRequest(requestContext);
    const after = parseStartingAfterRestRequest(requestContext);

    if (before && after) {
      throw new BadRequestException(
        `Only one of 'endingBefore' and 'startingAfter' may be provided`,
      );
    }

    return {
      paging: {
        first: !before ? limit : undefined,
        last: before ? limit : undefined,
        after,
        before,
      },
    };
  }
}
