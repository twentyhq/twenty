/* @license Enterprise */

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { isSelectValueAllowedByRowLevelPermissionPredicates } from '@/object-record/record-field/ui/meta-types/utils/isSelectValueAllowedByRowLevelPermissionPredicates';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/input';

export const useFilteredSelectOptionsFromRLSPredicates = ({
  fieldMetadataId,
  objectMetadataNameSingular,
  options,
}: {
  fieldMetadataId: string;
  objectMetadataNameSingular: string | undefined;
  options: SelectOption[];
}): { filteredOptions: SelectOption[]; canSelectEmpty: boolean } => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataId = objectMetadataNameSingular
    ? objectMetadataItems.find(
        (item) => item.nameSingular === objectMetadataNameSingular,
      )?.id
    : undefined;

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataId ?? '',
  );

  return useMemo(() => {
    if (!isDefined(objectMetadataId)) {
      return { filteredOptions: options, canSelectEmpty: true };
    }

    const hasPredicateOnField =
      objectPermissions.rowLevelPermissionPredicates.some(
        (predicate) => predicate.fieldMetadataId === fieldMetadataId,
      );

    if (!hasPredicateOnField) {
      return { filteredOptions: options, canSelectEmpty: true };
    }

    const isSelectValueAllowed = (selectValue: string | null) =>
      isSelectValueAllowedByRowLevelPermissionPredicates({
        fieldMetadataId,
        selectValue,
        predicates: objectPermissions.rowLevelPermissionPredicates,
        predicateGroups: objectPermissions.rowLevelPermissionPredicateGroups,
      });

    return {
      filteredOptions: options.filter((option) =>
        isSelectValueAllowed(option.value),
      ),
      canSelectEmpty: isSelectValueAllowed(null),
    };
  }, [
    objectMetadataId,
    objectPermissions.rowLevelPermissionPredicates,
    objectPermissions.rowLevelPermissionPredicateGroups,
    fieldMetadataId,
    options,
  ]);
};
