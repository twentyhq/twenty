import { BadRequestException } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { parseEndingBeforeRestRequest } from 'src/engine/api/rest/input-request-parsers/ending-before-parser-utils/parse-ending-before-rest-request.util';
import { parseLimitRestRequest } from 'src/engine/api/rest/input-request-parsers/limit-parser-utils/parse-limit-rest-request.util';
import { parseStartingAfterRestRequest } from 'src/engine/api/rest/input-request-parsers/starting-after-parser-utils/parse-starting-after-rest-request.util';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';
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

  // The raw value is checked before parsing because parseLimitRestRequest
  // clamps to the maximum first, which would turn a fractional value above
  // the cap into a valid integer limit.
  const requestedLimit = request.query?.limit;

  if (isNonEmptyString(requestedLimit) && !Number.isInteger(+requestedLimit)) {
    throw new BadRequestException(
      `limit '${requestedLimit}' is invalid. Should be an integer`,
    );
  }

  return {
    limit: parseLimitRestRequest(request),
    direction: isDefined(endingBefore) ? 'backward' : 'forward',
    afterId: startingAfter,
    beforeId: endingBefore,
  };
};
