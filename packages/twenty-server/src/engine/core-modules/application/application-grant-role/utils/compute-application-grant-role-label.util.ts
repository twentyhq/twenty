import { isDefined } from 'twenty-shared/utils';

import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

export const computeApplicationGrantRoleLabel = ({
  applicationName,
  flatRoleMaps,
}: {
  applicationName: string;
  flatRoleMaps: FlatRoleMaps;
}): string => {
  const takenLabels = new Set(
    Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map(({ label }) => label),
  );

  const baseLabel = `${applicationName} role`;
  let label = baseLabel;

  for (let suffix = 2; takenLabels.has(label); suffix++) {
    label = `${baseLabel} ${suffix}`;
  }

  return label;
};
