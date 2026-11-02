import { type GrantObjectAccess } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ApplicationGrantObjectAccessInput } from 'src/engine/core-modules/application/application-grant/dtos/application-grant-object-access.input';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';

export const fromObjectAccessInputToGrantObjectAccess = ({
  objectAccess,
  flatObjectMetadataMaps,
}: {
  objectAccess: ApplicationGrantObjectAccessInput;
  flatObjectMetadataMaps: Pick<
    FlatObjectMetadataMaps,
    'universalIdentifierById'
  >;
}): GrantObjectAccess => {
  const findObjectUniversalIdentifier = (objectMetadataId: string) => {
    const universalIdentifier =
      flatObjectMetadataMaps.universalIdentifierById[objectMetadataId];

    if (!isDefined(universalIdentifier)) {
      throw new ApplicationException(
        `Object ${objectMetadataId} not found`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return universalIdentifier;
  };

  return {
    chosenObjectUniversalIdentifiers: isDefined(
      objectAccess.chosenObjectMetadataIds,
    )
      ? objectAccess.chosenObjectMetadataIds.map(findObjectUniversalIdentifier)
      : null,
    addedObjects: objectAccess.addedObjects.map(
      ({ objectMetadataId, accessLevel }) => ({
        objectUniversalIdentifier:
          findObjectUniversalIdentifier(objectMetadataId),
        accessLevel:
          accessLevel as GrantObjectAccess['addedObjects'][number]['accessLevel'],
      }),
    ),
  };
};
