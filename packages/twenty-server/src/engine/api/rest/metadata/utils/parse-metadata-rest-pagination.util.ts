import { BadRequestException } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
import { DEFAULT_METADATA_REST_PAGE_SIZE } from 'src/engine/metadata-modules/pagination/constants/default-metadata-rest-page-size.constant';
import { MAX_METADATA_REST_PAGE_SIZE } from 'src/engine/metadata-modules/pagination/constants/max-metadata-rest-page-size.constant';
import { type MetadataCursorPagination } from 'src/engine/metadata-modules/pagination/types/metadata-cursor-pagination.type';

export const parseMetadataRestPagination = (
  request: AuthenticatedRequest,
): MetadataCursorPagination => {
  const startingAfter = parseStartingAfterRestRequest(request);
  const endingBefore = parseEndingBeforeRestRequest(request);

  if (isDefined(startingAfter) && isDefined(endingBefore)) {
    throw new BadRequestException(
      `'starting_after' and 'ending_before' cannot be used together.`,
    );
  }

  const invalidCursor = [startingAfter, endingBefore].find(
    (cursor) => isDefined(cursor) && !uuidValidate(cursor),
  );

  if (isDefined(invalidCursor)) {
    throw new BadRequestException(`Invalid cursor: ${invalidCursor}`);
  }

  return {
    limit: parseLimitRestRequest(
      request,
      DEFAULT_METADATA_REST_PAGE_SIZE,
      MAX_METADATA_REST_PAGE_SIZE,
    ),
    direction: isDefined(endingBefore) ? 'backward' : 'forward',
    afterId: startingAfter,
    beforeId: endingBefore,
  };
};
