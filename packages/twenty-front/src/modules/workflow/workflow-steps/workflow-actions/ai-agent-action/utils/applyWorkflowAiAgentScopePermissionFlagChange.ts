import { type AiRunScope } from 'twenty-shared/ai';
import { PERMISSION_FLAG_UNIVERSAL_IDENTIFIER_BY_TYPE } from 'twenty-shared/constants';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const applyWorkflowAiAgentScopePermissionFlagChange = ({
  scope,
  permissionFlagKey,
  value,
}: {
  scope: AiRunScope | undefined;
  permissionFlagKey: string;
  value: boolean;
}): AiRunScope => {
  const universalIdentifier =
    PERMISSION_FLAG_UNIVERSAL_IDENTIFIER_BY_TYPE.get(permissionFlagKey);

  if (!isDefined(universalIdentifier)) {
    throw new CustomError(
      doNotTranslate(`Unknown permission flag ${permissionFlagKey}`),
      'UNKNOWN_PERMISSION_FLAG',
    );
  }

  const otherUniversalIdentifiers = (
    scope?.permissionFlagUniversalIdentifiers ?? []
  ).filter(
    (existingUniversalIdentifier) =>
      existingUniversalIdentifier !== universalIdentifier,
  );

  return {
    ...scope,
    permissionFlagUniversalIdentifiers: value
      ? [...otherUniversalIdentifiers, universalIdentifier]
      : otherUniversalIdentifiers,
  };
};
