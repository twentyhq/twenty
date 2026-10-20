import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordInheritanceRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/RecordInheritanceRule';
import { type SettingsRoleRelatedRecordsRule } from '@/settings/roles/role-permissions/object-level-permissions/related-records/types/SettingsRoleRelatedRecordsRule';
import { getDeclaredRelatedRecordsRules } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getDeclaredRelatedRecordsRules';
import { getRecordInheritanceRulePathKey } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRecordInheritanceRulePathKey';
import { getRecordInheritanceRulePaths } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRecordInheritanceRulePaths';
import { MetadataReadability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const RULE_FOLLOWING_READABILITIES: MetadataReadability[] = [
  MetadataReadability.OPEN,
  MetadataReadability.PRIVATE,
  MetadataReadability.INHERITED,
];

export const getRelatedRecordsRules = ({
  parentObjectMetadataId,
  objectMetadataItems,
  recordInheritanceRules,
}: {
  parentObjectMetadataId: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordInheritanceRules: RecordInheritanceRule[];
}) => {
  const declaredRules = getDeclaredRelatedRecordsRules({
    parentObjectMetadataId,
    objectMetadataItems,
  });

  const candidateChildObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      !objectMetadataItem.isSystem &&
      objectMetadataItem.isActive &&
      objectMetadataItem.id !== parentObjectMetadataId &&
      RULE_FOLLOWING_READABILITIES.includes(objectMetadataItem.readability),
  );

  const pathsByKey = new Map(
    candidateChildObjectMetadataItems
      .flatMap((childObjectMetadataItem) =>
        getRecordInheritanceRulePaths({
          childObjectMetadataItem,
          parentObjectMetadataId,
          objectMetadataItems,
        }),
      )
      .map((path) => [getRecordInheritanceRulePathKey(path), path]),
  );

  const storedRules = recordInheritanceRules
    .filter((rule) => rule.parentObjectMetadataId === parentObjectMetadataId)
    .flatMap((rule): SettingsRoleRelatedRecordsRule[] => {
      const path = pathsByKey.get(getRecordInheritanceRulePathKey(rule));

      return isDefined(path)
        ? [{ ...path, key: rule.id, recordInheritanceRuleId: rule.id }]
        : [];
    });

  const usedPathKeys = new Set(
    recordInheritanceRules.map(getRecordInheritanceRulePathKey),
  );
  // A declared parent field already covers every path that starts with it
  const declaredFieldMetadataIds = new Set(
    declaredRules.map(({ fieldMetadataId }) => fieldMetadataId),
  );

  return {
    rules: [...declaredRules, ...storedRules],
    availableRules: [...pathsByKey.values()].filter(
      (path) =>
        !usedPathKeys.has(getRecordInheritanceRulePathKey(path)) &&
        !declaredFieldMetadataIds.has(path.fieldMetadataId),
    ),
  };
};
