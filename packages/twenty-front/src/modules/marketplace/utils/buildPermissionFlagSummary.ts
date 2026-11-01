import { PERMISSION_FLAG_SUMMARY_CONFIGS } from '@/marketplace/constants/PermissionFlagSummaryConfigs';
import { PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER } from '@/marketplace/constants/PermissionFlagTypeByUniversalIdentifier';
import { type PermissionSummaryItem } from '@/marketplace/types/PermissionSummaryItem';
import { isDefined } from 'twenty-shared/utils';

export const buildPermissionFlagSummary = (
  permissionFlagUniversalIdentifiers: string[],
): PermissionSummaryItem[] =>
  Array.from(new Set(permissionFlagUniversalIdentifiers)).flatMap(
    (universalIdentifier) => {
      const flagType =
        PERMISSION_FLAG_TYPE_BY_UNIVERSAL_IDENTIFIER.get(universalIdentifier);

      if (!isDefined(flagType)) {
        return [];
      }

      const { Icon, getLabel } = PERMISSION_FLAG_SUMMARY_CONFIGS[flagType];

      return [{ Icon, label: getLabel() }];
    },
  );
