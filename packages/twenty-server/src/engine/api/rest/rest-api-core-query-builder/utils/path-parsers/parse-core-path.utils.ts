import { BadRequestException } from '@nestjs/common';

import { Request } from 'express';

export const parseCorePath = (
  request: Request,
): { object: string; id?: string } => {
  const queryAction = request.path.replace('/rest/', '').split('/');

  if (queryAction.length > 2) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /rest/companies/id or /rest/companies`,
    );
  }

  if (queryAction.length === 1) {
    return { object: queryAction[0] };
  }

  return { object: queryAction[0], id: queryAction[1] };
};
