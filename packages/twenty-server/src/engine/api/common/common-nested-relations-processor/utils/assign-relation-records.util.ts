import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export const assignRelationRecords = ({
  parentRecords,
  relationRecords,
  sourceFieldName,
  joinField,
  joinColumnName,
  relationType,
  selectedFields,
}: {
  parentRecords: ObjectRecord[];
  relationRecords: ObjectRecord[];
  sourceFieldName: string;
  joinField: string;
  joinColumnName: string;
  relationType: RelationType;
  selectedFields: Record<string, unknown>;
}): void => {
  if (relationType === RelationType.ONE_TO_MANY) {
    const relationRecordsByParentId = new Map<unknown, ObjectRecord[]>();

    for (const relationRecord of relationRecords) {
      const parentId = relationRecord[joinField];
      const records = relationRecordsByParentId.get(parentId);

      if (isDefined(records)) {
        records.push(relationRecord);
      } else {
        relationRecordsByParentId.set(parentId, [relationRecord]);
      }
    }

    for (const parentRecord of parentRecords) {
      parentRecord[sourceFieldName] = [
        ...(relationRecordsByParentId.get(parentRecord.id) ?? []),
      ];
    }

    return;
  }

  const relationRecordById = new Map<unknown, ObjectRecord>();

  for (const relationRecord of relationRecords) {
    if (!relationRecordById.has(relationRecord.id)) {
      relationRecordById.set(relationRecord.id, relationRecord);
    }
  }

  for (const parentRecord of parentRecords) {
    const matchedRelation = relationRecordById.get(
      parentRecord[joinColumnName],
    );

    if (isDefined(matchedRelation?.deletedAt)) {
      parentRecord[sourceFieldName] = null;
      parentRecord[joinColumnName] = null;
    } else if (isDefined(matchedRelation)) {
      if (selectedFields?.deletedAt !== true) {
        const { deletedAt: _, ...rest } = matchedRelation;

        parentRecord[sourceFieldName] = rest;
      } else {
        parentRecord[sourceFieldName] = matchedRelation;
      }
    } else {
      parentRecord[sourceFieldName] = null;
    }
  }
};
