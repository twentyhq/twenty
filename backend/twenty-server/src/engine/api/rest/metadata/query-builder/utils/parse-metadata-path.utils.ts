import { BadRequestException } from '@nestjs/common';

import {
  type ObjectName,
  type ObjectNameSingularAndPlural,
} from 'src/engine/api/rest/metadata/types/metadata-entity.type';

const getObjectNames = (
  objectName: ObjectName,
): ObjectNameSingularAndPlural => {
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

  const { objectNameSingular, objectNamePlural } = getObjectNames(
    queryAction[0] as ObjectName,
  );

  return {
    objectNameSingular,
    objectNamePlural,
    ...(hasId ? { id: queryAction[1] } : {}),
  };
};
