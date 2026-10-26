import {
  type CompositeFieldSubFieldName,
  type RecordGqlOperationFilter,
  type RecordPermissionCondition,
} from 'twenty-shared/types';
import {
  convertViewFilterValueToString,
  isDefined,
  type RecordFilter,
} from 'twenty-shared/utils';
import { isRecordPermissionConditionMemberDependent } from 'src/engine/core-modules/record-permission/utils/is-record-permission-condition-member-dependent.util';

import {
  type RecordPermissionAuthority,
  type RecordPermissionMetadata,
} from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/twenty-orm/constants/unsatisfiable-record-filter.constant';
import { resolveWorkspaceMemberPredicateValue } from 'src/engine/twenty-orm/utils/resolve-workspace-member-predicate-value.util';
import { validatePredicateValueCompatibility } from 'src/engine/twenty-orm/utils/validate-predicate-value-compatibility.util';
import { computeRecordGqlOperationFilterFromFlatMaps } from 'src/engine/utils/compute-record-gql-operation-filter-from-flat-maps.util';

export const bindRecordPermissionCondition = ({
  condition,
  authority,
  metadata,
  objectUniversalIdentifier,
}: {
  condition: RecordPermissionCondition | null;
  authority: RecordPermissionAuthority;
  metadata: RecordPermissionMetadata;
  objectUniversalIdentifier: string;
}): RecordGqlOperationFilter | null => {
  if (!isDefined(condition)) {
    return null;
  }

  if (condition.kind !== 'predicate') {
    if (condition.conditions.length === 0) {
      throw new Error('A permission condition group cannot be empty');
    }

    const filters = condition.conditions.map(
      (child) =>
        bindRecordPermissionCondition({
          condition: child,
          authority,
          metadata,
          objectUniversalIdentifier,
        }) ?? {},
    );

    return condition.kind === 'all' ? { and: filters } : { or: filters };
  }

  const fieldMetadata =
    metadata.flatFieldMetadataMaps.byUniversalIdentifier[
      condition.fieldUniversalIdentifier
    ];
  const objectMetadata =
    metadata.flatObjectMetadataMaps.byUniversalIdentifier[
      objectUniversalIdentifier
    ];

  if (
    !isDefined(fieldMetadata) ||
    !isDefined(objectMetadata) ||
    fieldMetadata.objectMetadataId !== objectMetadata.id
  ) {
    throw new Error(
      'Permission predicate field does not belong to the target object',
    );
  }

  let value = condition.value;

  if (isDefined(condition.memberFieldUniversalIdentifier)) {
    const memberFieldMetadata =
      metadata.flatFieldMetadataMaps.byUniversalIdentifier[
        condition.memberFieldUniversalIdentifier
      ];
    const memberObject = isDefined(memberFieldMetadata)
      ? Object.values(
          metadata.flatObjectMetadataMaps.byUniversalIdentifier,
        ).find((object) => object?.id === memberFieldMetadata.objectMetadataId)
      : undefined;

    if (
      !isDefined(memberFieldMetadata) ||
      memberObject?.nameSingular !== 'workspaceMember'
    ) {
      throw new Error(
        'Dynamic permission values must reference a workspace member field',
      );
    }

    if (!isDefined(authority.workspaceMember)) {
      return UNSATISFIABLE_RECORD_FILTER;
    }

    value = resolveWorkspaceMemberPredicateValue({
      workspaceMember: authority.workspaceMember,
      workspaceMemberFieldMetadata: memberFieldMetadata,
      workspaceMemberSubFieldName: condition.memberSubFieldName ?? null,
    });

    if (
      !isDefined(value) ||
      !validatePredicateValueCompatibility({
        workspaceMemberFieldMetadata: memberFieldMetadata,
        targetFieldMetadata: fieldMetadata,
        predicateValue: value,
      })
    ) {
      return UNSATISFIABLE_RECORD_FILTER;
    }
  }

  if (
    isRecordPermissionConditionMemberDependent(condition) &&
    !isDefined(authority.workspaceMember)
  ) {
    return UNSATISFIABLE_RECORD_FILTER;
  }

  return computeRecordGqlOperationFilterFromFlatMaps({
    ...metadata,
    recordFilters: [
      {
        fieldMetadataId: fieldMetadata.id,
        operand: condition.operand as unknown as RecordFilter['operand'],
        value: convertViewFilterValueToString(value),
        subFieldName: condition.subFieldName as
          | CompositeFieldSubFieldName
          | undefined,
      },
    ],
    recordFilterGroups: [],
    filterValueDependencies: {
      currentWorkspaceMemberId: authority.workspaceMember?.id,
    },
  });
};
