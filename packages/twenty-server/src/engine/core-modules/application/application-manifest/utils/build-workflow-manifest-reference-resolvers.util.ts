import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const buildWorkflowManifestReferenceResolvers = ({
  references,
  subject,
}: {
  references: WorkflowManifestReferences;
  subject: string;
}) => {
  const resolve = <T>(
    map: ReadonlyMap<string, T> | undefined,
    identifier: string,
    kind: string,
  ): T => {
    const value = map?.get(identifier);
    if (!isDefined(value)) {
      throw new ApplicationException(
        `${subject}: missing ${kind} ${identifier}`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`The workflow references metadata that is not available to this application.`,
        },
      );
    }
    return value;
  };
  const objectName = (identifier: string) =>
    resolve(references.objectByUniversalIdentifier, identifier, 'object')
      .nameSingular;
  const field = (identifier: string, objectUniversalIdentifier?: string) => {
    const resolved = resolve(
      references.fieldByUniversalIdentifier,
      identifier,
      'field',
    );
    if (
      isDefined(objectUniversalIdentifier) &&
      resolved.objectUniversalIdentifier !== objectUniversalIdentifier
    ) {
      throw new ApplicationException(
        'Workflow field does not belong to the referenced object',
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`The workflow field does not belong to the referenced object.`,
        },
      );
    }
    return resolved;
  };
  const fieldReference = <
    T extends { fieldMetadataUniversalIdentifier?: string },
  >(
    reference: T,
    objectUniversalIdentifier?: string,
  ) => {
    const { fieldMetadataUniversalIdentifier, ...rest } = reference;
    return {
      ...rest,
      ...(isDefined(fieldMetadataUniversalIdentifier)
        ? {
            fieldMetadataId: field(
              fieldMetadataUniversalIdentifier,
              objectUniversalIdentifier,
            ).id,
          }
        : {}),
    };
  };

  return { resolve, objectName, field, fieldReference };
};
