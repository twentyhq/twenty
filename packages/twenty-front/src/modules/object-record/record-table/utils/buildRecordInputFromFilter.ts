import { type CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { buildValueFromFilter } from '@/object-record/record-table/utils/buildValueFromFilter';
import { type ObjectRecord } from 'twenty-shared/types';
import { deepMerge, isDefined } from 'twenty-shared/utils';
import { ViewFilterGroupLogicalOperator } from '~/generated-metadata/graphql';

const isFilterInOrFilterGroup = ({
  filter,
  recordFilterGroups,
}: {
  filter: RecordFilter;
  recordFilterGroups: RecordFilterGroup[];
}): boolean => {
  if (!isDefined(filter.recordFilterGroupId)) {
    return false;
  }

  const recordFilterGroupsById = new Map(
    recordFilterGroups.map((recordFilterGroup) => [
      recordFilterGroup.id,
      recordFilterGroup,
    ]),
  );

  let currentRecordFilterGroupId: string | null | undefined =
    filter.recordFilterGroupId;

  while (isDefined(currentRecordFilterGroupId)) {
    const recordFilterGroup = recordFilterGroupsById.get(
      currentRecordFilterGroupId,
    );

    if (!isDefined(recordFilterGroup)) {
      return false;
    }

    if (
      recordFilterGroup.logicalOperator ===
      ViewFilterGroupLogicalOperator.OR
    ) {
      return true;
    }

    currentRecordFilterGroupId = recordFilterGroup.parentRecordFilterGroupId;
  }

  return false;
};

export const buildRecordInputFromFilter = ({
  currentRecordFilters,
  currentRecordFilterGroups = [],
  objectMetadataItem,
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
    uneditableFields?: Pick<FieldMetadataItem, 'id'>[];
  };
  currentWorkspaceMember?: CurrentWorkspaceMember;
  currentRecordId?: string;
  timeZone: string;
}): Partial<ObjectRecord> => {
  const recordInput: Partial<ObjectRecord> = {};

  const uneditableFieldIds = new Set(
    (objectMetadataItem.uneditableFields ?? []).map((field) => field.id),
  );

  currentRecordFilters.forEach((filter) => {
    const fieldMetadataItem = objectMetadataItem.fields.find(
      (field) => field.id === filter.fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    // A relation-traversal filter constrains the related record, not a column to prefill.
    if (isDefined(filter.relationTargetFieldMetadataId)) {
      return;
    }

    // A field the current member cannot edit must not be sent in a create input.
    if (uneditableFieldIds.has(fieldMetadataItem.id)) {
      return;
    }

    // Filters inside an OR group are alternatives. Copying one branch into the
    // new record is arbitrary and can force a value that the user did not choose.
    if (
      isFilterInOrFilterGroup({
        filter,
        recordFilterGroups: currentRecordFilterGroups,
      })
    ) {
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
