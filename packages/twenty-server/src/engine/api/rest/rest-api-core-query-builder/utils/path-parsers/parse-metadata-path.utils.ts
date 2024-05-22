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

  if (!['fields', 'objects', 'relations'].includes(queryAction[0])) {
    throw new BadRequestException(
      `Query path '${request.path}' invalid. Metadata path "${queryAction[0]}" does not exist. Valid examples: /rest/metadata/fields or /rest/metadata/objects or /rest/metadata/relations`,
    );
  }

  const objectName = queryAction[0];

  if (queryAction.length === 2) {
    switch (objectName) {
      case 'fields':
        return {
          objectNameSingular: 'field',
          objectNamePlural: objectName,
          id: queryAction[1],
        };
      case 'objects':
        return {
          objectNameSingular: 'object',
          objectNamePlural: objectName,
          id: queryAction[1],
        };
      case 'relations':
        return {
          objectNameSingular: 'relation',
          objectNamePlural: objectName,
          id: queryAction[1],
        };
      default:
        return { objectNameSingular: '', objectNamePlural: '', id: '' };
    }
  } else {
    switch (objectName) {
      case 'fields':
        return { objectNameSingular: 'field', objectNamePlural: objectName };
      case 'objects':
        return { objectNameSingular: 'object', objectNamePlural: objectName };
      case 'relations':
        return { objectNameSingular: 'relation', objectNamePlural: objectName };
      default:
        return { objectNameSingular: '', objectNamePlural: '' };
    }
  }
};
