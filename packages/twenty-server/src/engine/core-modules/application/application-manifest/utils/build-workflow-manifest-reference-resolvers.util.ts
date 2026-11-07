import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { WORKFLOW_CONNECTED_ACCOUNT_STEP_CAPABILITY } from 'src/engine/core-modules/application/application-manifest/constants/workflow-connected-account-step-capability.constant';
import { type WorkflowConnectedAccountStepType } from 'src/engine/core-modules/application/application-manifest/types/workflow-connected-account-step-type.type';
import { findWorkflowStepConnectedAccount } from 'src/engine/core-modules/application/application-manifest/utils/find-workflow-step-connected-account.util';
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

  const connectedAccountIdOrThrow = ({
    stepType,
    handle,
  }: {
    stepType: WorkflowConnectedAccountStepType;
    handle: string;
  }) => {
    const connectedAccount = findWorkflowStepConnectedAccount({
      stepType,
      handle,
      connectedAccounts: references.connectedAccounts ?? [],
    });
    if (!isDefined(connectedAccount)) {
      throw new ApplicationException(
        `${subject}: no connected account ${handle} shared with this workspace can ${WORKFLOW_CONNECTED_ACCOUNT_STEP_CAPABILITY[stepType]}`,
        ApplicationExceptionCode.INVALID_INPUT,
        {
          userFriendlyMessage: msg`The workflow uses connected account ${handle}, which is not connected and shared in this workspace.`,
        },
      );
    }
    return connectedAccount.id;
  };

  return {
    resolve,
    objectName,
    field,
    fieldReference,
    connectedAccountIdOrThrow,
  };
};
