import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildValueFromFilter } from '@/object-record/record-table/utils/buildValueFromFilter';
import {
  type ObjectRecord,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { deepMerge, isDefined } from 'twenty-shared/utils';

const isFilterInOrRecordFilterGroup = (
  recordFilterGroupId: string | undefined,
  recordFilterGroupsById: Map<string, RecordFilterGroup>,
): boolean => {
  const visitedGroupIds = new Set<string>();
  let currentGroupId: string | null | undefined = recordFilterGroupId;

  while (isDefined(currentGroupId) && !visitedGroupIds.has(currentGroupId)) {
    visitedGroupIds.add(currentGroupId);

    const recordFilterGroup = recordFilterGroupsById.get(currentGroupId);

    if (!isDefined(recordFilterGroup)) {
      return false;
    }

    if (
      recordFilterGroup.logicalOperator === RecordFilterGroupLogicalOperator.OR
    ) {
      return true;
    }

    currentGroupId = recordFilterGroup.parentRecordFilterGroupId;
  }

  return false;
};

export const buildRecordInputFromFilter = ({
  currentRecordFilters,
  currentRecordFilterGroups,
  objectMetadataItem,
  uneditableFields,
  currentWorkspaceMember,
  currentRecordId,
  timeZone,
}: {
  currentRecordFilters: RecordFilter[];
  currentRecordFilterGroups?: RecordFilterGroup[];
  objectMetadataItem: {
    fields: (Pick<FieldMetadataItem, 'id' | 'name' | 'type' | 'options'> & {
      relation?: Pick<FieldMetadataItemRelation, 'type'> | null;
    })[];
  };
  uneditableFields?: string[];
  currentWorkspaceMember?: CurrentWorkspaceMember;
  currentRecordId?: string;
  timeZone: string;
}): Partial<ObjectRecord> => {
  const recordInput: Partial<ObjectRecord> = {};
  const uneditableFieldIdSet = new Set(uneditableFields ?? []);
  const recordFilterGroupsById = new Map(
    (currentRecordFilterGroups ?? []).map((group) => [group.id, group]),
  );

  currentRecordFilters.forEach((filter) => {
    const fieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.id === filter.fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    if (uneditableFieldIdSet.has(filter.fieldMetadataId)) {
      return;
    }

    if (
      isFilterInOrRecordFilterGroup(
        filter.recordFilterGroupId,
        recordFilterGroupsById,
      )
    ) {
      return;
    }

    // A relation-traversal filter constrains the related record, not a column to prefill.
    if (isDefined(filter.relationTargetFieldMetadataId)) {
      return;
    }

    if (fieldMetadataItem.type === 'RELATION') {
      const value = buildValueFromFilter({
        filter,
        options: fieldMetadataItem.options ?? undefined,
        relationType: fieldMetadataItem.relation?.type,
        currentWorkspaceMember: currentWorkspaceMember ?? undefined,
        currentRecordId,
        label: filter.label,
        timeZone,
      });

      if (!isDefined(value)) {
        return;
      }

      recordInput[`${fieldMetadataItem.name}Id`] = value;
    } else {
      const value = buildValueFromFilter({
        filter,
        options: fieldMetadataItem.options ?? undefined,
        timeZone,
      });

      if (!isDefined(value)) {
        return;
      }

      if (isCompositeFieldType(fieldMetadataItem.type)) {
        recordInput[fieldMetadataItem.name] = deepMerge(
          recordInput[fieldMetadataItem.name] ?? {},
          value,
        );
      } else {
        recordInput[fieldMetadataItem.name] = value;
      }
    }
  });

  return recordInput;
};
