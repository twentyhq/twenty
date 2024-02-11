import { BadRequestException } from '@nestjs/common';

import { Request } from 'express';

export const parsePath = (
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

export const parseMetadataPath = (
  request: Request,
): { object: string; id?: string } => {
  const queryAction = request.path.replace('/rest/metadata/', '').split('/');

  if (queryAction.length > 3) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /rest/metadata/fields or /rest/metadata/objects/id`,
    );
  }

  if (!['fields', 'objects', 'relations'].includes(queryAction[0])) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Metadata path "${queryAction[0]}" does not exist. Valid examples: /rest/fields or /rest/objects or /rest/relations`,
    );
  }

  const objectName = queryAction[0];

  if (queryAction.length === 2) {
    switch (objectName) {
      case 'fields':
        return { object: 'field', id: queryAction[1] };
      case 'objects':
        return { object: 'object', id: queryAction[1] };
      case 'relations':
        return { object: 'relation', id: queryAction[1] };
      default:
        return { object: '', id: '' };
    }
  } else {
    switch (objectName) {
      case 'fields':
        return { object: 'field' };
      case 'objects':
        return { object: 'object' };
      case 'relations':
        return { object: 'relation' };
      default:
        return { object: '' };
    }
  }
};
