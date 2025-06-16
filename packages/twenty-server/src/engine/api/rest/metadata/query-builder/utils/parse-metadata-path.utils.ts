import { BadRequestException } from '@nestjs/common';

import { Request } from 'express';

export const parseMetadataPath = (
  request: Request,
): { objectNameSingular: string; objectNamePlural: string; id?: string } => {
  const queryAction = request.path.replace('/rest/metadata/', '').split('/');

  if (queryAction.length >= 3 || queryAction.length === 0) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Valid examples: /rest/metadata/fields or /rest/metadata/objects/id`,
    );
  }

  if (!['fields', 'objects'].includes(queryAction[0])) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Metadata path "${queryAction[0]}" does not exist. Valid examples: /rest/metadata/fields or /rest/metadata/objects`,
    );
  }

  const objectName = queryAction[0];

  if (queryAction.length === 2) {
    switch (objectName) {
      case 'fields':
        return {
          objectNameSingular: 'field',
          objectNamePlural: 'fields',
          id: queryAction[1],
        };
      case 'objects':
        return {
          objectNameSingular: 'object',
          objectNamePlural: 'objects',
          id: queryAction[1],
        };
      default:
        return { objectNameSingular: '', objectNamePlural: '', id: '' };
    }
  } else {
    switch (objectName) {
      case 'fields':
        return { objectNameSingular: 'field', objectNamePlural: 'fields' };
      case 'objects':
        return { objectNameSingular: 'object', objectNamePlural: 'objects' };
      default:
        return { objectNameSingular: '', objectNamePlural: '' };
    }
  }
};
