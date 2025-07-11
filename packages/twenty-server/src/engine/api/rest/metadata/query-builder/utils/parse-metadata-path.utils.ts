import { BadRequestException } from '@nestjs/common';

import {
  ObjectName,
  ObjectNameSingularAndPlural,
} from 'src/engine/api/rest/metadata/types/metadata-entity.type';

const getResult = (objectName: ObjectName): ObjectNameSingularAndPlural => {
  return {
    objectNameSingular: objectName.substring(
      0,
      objectName.length - 1,
    ) as ObjectNameSingularAndPlural['objectNameSingular'],
    objectNamePlural: objectName,
  };
};

export const parseMetadataPath = (
  path: string,
): ObjectNameSingularAndPlural => {
  const queryAction = path.replace('/rest/metadata/', '').split('/');

  if (queryAction.length >= 3 || queryAction.length === 0) {
    throw new BadRequestException(
      `Query path '${path}' invalid. Valid examples: /rest/metadata/fields or /rest/metadata/objects/id`,
    );
  }

  if (!['fields', 'objects'].includes(queryAction[0])) {
    throw new BadRequestException(
      `Query path '${path}' invalid. Metadata path "${queryAction[0]}" does not exist. Valid examples: /rest/metadata/fields or /rest/metadata/objects`,
    );
  }

  const hasId = queryAction.length === 2;

  const result = getResult(queryAction[0] as ObjectName);

  return {
    ...result,
    ...(hasId ? { id: queryAction[1] } : {}),
  };
};
