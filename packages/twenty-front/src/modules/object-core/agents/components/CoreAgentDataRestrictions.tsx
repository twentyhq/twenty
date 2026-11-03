import { useCoreAgentEditStatus } from '@/object-core/agents/hooks/useCoreAgentEditStatus';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';

type CoreAgentDataRestrictionsProps = {
  agentId?: string;
  objectMetadataId: string;
};

export const CoreAgentDataRestrictions = ({
  agentId,
  objectMetadataId,
}: CoreAgentDataRestrictionsProps) => {
  const { t } = useLingui();
  const { draftRole } = useCoreAgentEditStatus({ agentId });
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataId,
  );
  const restrictions =
    draftRole.fieldPermissions?.filter(
      (permission) => permission.objectMetadataId === objectMetadataId,
    ) ?? [];
  const predicates =
    draftRole.rowLevelPermissionPredicates?.filter(
      (predicate) => predicate.objectMetadataId === objectMetadataId,
    ) ?? [];
  const storedRestrictions = draftRole.objectPermissions?.find(
    (permission) => permission.objectMetadataId === objectMetadataId,
  )?.restrictedFields;
  const restrictionLabels = restrictions.flatMap((permission) => {
    const fieldLabel =
      objectMetadataItem?.fields.find(
        (field) => field.id === permission.fieldMetadataId,
      )?.label ?? permission.fieldMetadataId;
    return [
      permission.canReadFieldValue === false
        ? t`Cannot see ${fieldLabel}`
        : null,
      permission.canUpdateFieldValue === false
        ? t`Cannot edit ${fieldLabel}`
        : null,
    ].filter(isDefined);
  });
  const restrictedFieldNames = isPlainObject(storedRestrictions)
    ? Object.keys(storedRestrictions)
    : [];

  return (
    <>
      {restrictionLabels.map((label) => (
        <Text key={label} color="secondary">
          {label}
        </Text>
      ))}
      {isNonEmptyArray(restrictedFieldNames) && (
        <Text color="secondary">{t`Stored field restrictions: ${restrictedFieldNames.join(', ')}`}</Text>
      )}
      {isNonEmptyArray(predicates) && (
        <Text color="secondary">{t`${predicates.length} record filters apply. Inspect their conditions in Roles.`}</Text>
      )}
    </>
  );
};
