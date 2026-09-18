import { isDefined, isEmptyObject } from 'twenty-shared/utils';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { readAuthoredOverrideProperty } from 'src/engine/metadata-modules/overrides/utils/read-authored-override-property.util';

export type WorkspaceLocalStateProperties = {
  isActive: boolean;
  overrides: object | null;
  applicationUniversalIdentifier: string;
};

export const getWorkspaceLocalStateReason = ({
  metadataName,
  isActive = true,
  overrides = null,
  applicationUniversalIdentifier,
}: Partial<WorkspaceLocalStateProperties> & {
  metadataName: AllMetadataName;
}): string | undefined => {
  const overriddenIsActive = readAuthoredOverrideProperty({
    metadataName,
    overrides,
    path: ['isActive'],
    authorContext: {
      ownerApplicationUniversalIdentifier: applicationUniversalIdentifier,
    },
  });
  const effectiveIsActive =
    typeof overriddenIsActive === 'boolean' ? overriddenIsActive : isActive;
  const reasons = [
    ...(effectiveIsActive
      ? []
      : ['deactivated in this workspace, exported active']),
    ...(isDefined(overrides) && !isEmptyObject(overrides)
      ? ['workspace overrides not exported']
      : []),
  ];

  return reasons.length > 0 ? reasons.join(', ') : undefined;
};
