import { PERMISSION_FLAG_SUMMARY_CONFIGS } from '@/marketplace/constants/PermissionFlagSummaryConfigs';
import { PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER } from '@/marketplace/constants/PermissionFlagTypeByUniversalIdentifier';
import { type PermissionSummaryItem } from '@/marketplace/types/PermissionSummaryItem';
import { plural } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLock } from 'twenty-ui/icon';

const getPermissionFlagItem = ({
  universalIdentifier,
  appPermissionFlagsByUniversalIdentifier,
}: {
  universalIdentifier: string;
  appPermissionFlagsByUniversalIdentifier: ReadonlyMap<
    string,
    PermissionSummaryItem
  >;
}): PermissionSummaryItem | undefined => {
  const flagType =
    PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER.get(universalIdentifier);

  if (isDefined(flagType)) {
    const { Icon, getLabel } = PERMISSION_FLAG_SUMMARY_CONFIGS[flagType];

    return { Icon, label: getLabel() };
  }

  return appPermissionFlagsByUniversalIdentifier.get(universalIdentifier);
};

export const buildPermissionFlagSummary = ({
  permissionFlagUniversalIdentifiers,
  appPermissionFlagsByUniversalIdentifier,
}: {
  permissionFlagUniversalIdentifiers: string[];
  appPermissionFlagsByUniversalIdentifier: ReadonlyMap<
    string,
    PermissionSummaryItem
  >;
}): PermissionSummaryItem[] => {
  const uniqueUniversalIdentifiers = Array.from(
    new Set(permissionFlagUniversalIdentifiers),
  );

  const items = uniqueUniversalIdentifiers
    .map((universalIdentifier) =>
      getPermissionFlagItem({
        universalIdentifier,
        appPermissionFlagsByUniversalIdentifier,
      }),
    )
    .filter(isDefined);

  const unresolvedCount = uniqueUniversalIdentifiers.length - items.length;

  if (unresolvedCount === 0) {
    return items;
  }

  return [
    ...items,
    {
      Icon: IconLock,
      label: plural(unresolvedCount, {
        one: '# other permission',
        other: '# other permissions',
      }),
    },
  ];
};
