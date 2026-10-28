import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type WorkflowManifestReferences } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';
import { WORKFLOW_CONNECTED_ACCOUNT_STEP_CAPABILITY } from 'src/engine/core-modules/application/application-manifest/constants/workflow-connected-account-step-capability.constant';
import { type WorkflowConnectedAccountStepType } from 'src/engine/core-modules/application/application-manifest/types/workflow-connected-account-step-type.type';
import { findWorkflowStepConnectedAccount } from 'src/engine/core-modules/application/application-manifest/utils/find-workflow-step-connected-account.util';
import { computeWorkflowWatchedFieldName } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-watched-field-name.util';

const UNRESOLVED_REFERENCE = '';

const toObjectFieldKey = ({
  objectUniversalIdentifier,
  name,
}: {
  objectUniversalIdentifier: string;
  name: string;
}) => `${objectUniversalIdentifier}:${name}`;

const invertIdentifierMap = (
  idByUniversalIdentifier: ReadonlyMap<string, string> | undefined,
): Map<string, string> =>
  new Map(
    [...(idByUniversalIdentifier ?? new Map<string, string>())].map(
      ([universalIdentifier, id]) => [id, universalIdentifier],
    ),
  );

// Unresolved references become '' and record a reason, so converters report it once at the end.
export const buildWorkflowManifestInverseReferenceResolvers = (
  references: WorkflowManifestReferences,
) => {
  const unsupportedReasons: string[] = [];
  const objectUniversalIdentifierByNameSingular = new Map<string, string>();
  const fieldUniversalIdentifierById = new Map<string, string>();
  const fieldUniversalIdentifierByObjectFieldName = new Map<string, string>();
  const fieldUniversalIdentifierByWatchedFieldName = new Map<string, string>();
  const logicFunctionUniversalIdentifierById = invertIdentifierMap(
    references.logicFunctionIdByUniversalIdentifier,
  );
  const agentUniversalIdentifierById = invertIdentifierMap(
    references.agentIdByUniversalIdentifier,
  );

  const connectedAccounts = references.connectedAccounts ?? [];
  const connectedAccountById = new Map(
    connectedAccounts.map((connectedAccount) => [
      connectedAccount.id,
      connectedAccount,
    ]),
  );

  for (const [
    universalIdentifier,
    object,
  ] of references.objectByUniversalIdentifier ?? []) {
    objectUniversalIdentifierByNameSingular.set(
      object.nameSingular,
      universalIdentifier,
    );
  }

  for (const [
    universalIdentifier,
    field,
  ] of references.fieldByUniversalIdentifier ?? []) {
    const { objectUniversalIdentifier } = field;
    const watchedFieldName = computeWorkflowWatchedFieldName(field);

    fieldUniversalIdentifierById.set(field.id, universalIdentifier);
    fieldUniversalIdentifierByObjectFieldName.set(
      toObjectFieldKey({ objectUniversalIdentifier, name: field.name }),
      universalIdentifier,
    );

    if (isDefined(watchedFieldName)) {
      fieldUniversalIdentifierByWatchedFieldName.set(
        toObjectFieldKey({ objectUniversalIdentifier, name: watchedFieldName }),
        universalIdentifier,
      );
    }
  }

  const markUnsupported = (reason: string): string => {
    unsupportedReasons.push(reason);

    return UNRESOLVED_REFERENCE;
  };

  const resolveOrMarkUnsupported = ({
    universalIdentifier,
    reason,
  }: {
    universalIdentifier: string | undefined;
    reason: string;
  }): string => universalIdentifier ?? markUnsupported(reason);

  const objectUniversalIdentifier = (nameSingular: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof nameSingular === 'string'
          ? objectUniversalIdentifierByNameSingular.get(nameSingular)
          : undefined,
      reason: 'workflow referencing an object that is not exported',
    });

  const fieldUniversalIdentifier = (fieldMetadataId: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof fieldMetadataId === 'string'
          ? fieldUniversalIdentifierById.get(fieldMetadataId)
          : undefined,
      reason: 'workflow referencing a field that is not exported',
    });

  const fieldUniversalIdentifierByName = ({
    objectUniversalIdentifier,
    fieldName,
  }: {
    objectUniversalIdentifier: string;
    fieldName: unknown;
  }): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof fieldName === 'string'
          ? fieldUniversalIdentifierByObjectFieldName.get(
              toObjectFieldKey({ objectUniversalIdentifier, name: fieldName }),
            )
          : undefined,
      reason: 'workflow referencing a field that is not exported',
    });

  const watchedFieldUniversalIdentifier = ({
    objectUniversalIdentifier,
    watchedFieldName,
  }: {
    objectUniversalIdentifier: string;
    watchedFieldName: unknown;
  }): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof watchedFieldName === 'string'
          ? fieldUniversalIdentifierByWatchedFieldName.get(
              toObjectFieldKey({
                objectUniversalIdentifier,
                name: watchedFieldName,
              }),
            )
          : undefined,
      reason: 'workflow watching a field that is not exported',
    });

  const logicFunctionUniversalIdentifier = (logicFunctionId: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof logicFunctionId === 'string'
          ? logicFunctionUniversalIdentifierById.get(logicFunctionId)
          : undefined,
      reason:
        'workflow step on a logic function that is not a workflow action of this application',
    });

  const agentUniversalIdentifier = (agentId: unknown): string =>
    resolveOrMarkUnsupported({
      universalIdentifier:
        typeof agentId === 'string'
          ? agentUniversalIdentifierById.get(agentId)
          : undefined,
      reason: 'workflow step on an agent of another application',
    });

  // Values that are not a shared account of the workspace (variables, member ids, private accounts) are kept as they are
  const connectedAccountReference = ({
    stepType,
    connectedAccountId,
  }: {
    stepType: WorkflowConnectedAccountStepType;
    connectedAccountId: unknown;
  }): { connectedAccountId: unknown } | { connectedAccountHandle: string } => {
    const connectedAccount =
      typeof connectedAccountId === 'string'
        ? connectedAccountById.get(connectedAccountId)
        : undefined;

    if (
      !isDefined(connectedAccount) ||
      connectedAccount.scope !== 'WORKSPACE'
    ) {
      return { connectedAccountId };
    }

    const { handle } = connectedAccount;
    const resolvedConnectedAccount = findWorkflowStepConnectedAccount({
      stepType,
      handle,
      connectedAccounts,
    });

    if (resolvedConnectedAccount?.id === connectedAccount.id) {
      return { connectedAccountHandle: handle };
    }

    if (isDefined(connectedAccount.archivedAt)) {
      markUnsupported(`workflow step on archived connected account ${handle}`);
    } else if (isDefined(resolvedConnectedAccount)) {
      markUnsupported(
        `workflow step on connected account ${handle}, whose handle names an older account of the workspace`,
      );
    } else {
      markUnsupported(
        `workflow step on connected account ${handle}, which cannot ${WORKFLOW_CONNECTED_ACCOUNT_STEP_CAPABILITY[stepType]}`,
      );
    }

    return { connectedAccountHandle: UNRESOLVED_REFERENCE };
  };

  const fieldReference = (
    reference: unknown,
  ): Record<string, unknown> | undefined => {
    if (!isPlainObject(reference)) {
      return undefined;
    }

    const { fieldMetadataId, ...rest } = reference;

    return isDefined(fieldMetadataId)
      ? {
          ...rest,
          fieldMetadataUniversalIdentifier:
            fieldUniversalIdentifier(fieldMetadataId),
        }
      : rest;
  };

  return {
    objectUniversalIdentifier,
    fieldUniversalIdentifier,
    fieldReference,
    fieldUniversalIdentifierByName,
    watchedFieldUniversalIdentifier,
    logicFunctionUniversalIdentifier,
    agentUniversalIdentifier,
    connectedAccountReference,
    markUnsupported,
    getUnsupportedReason: (): string | undefined => unsupportedReasons[0],
  };
};
