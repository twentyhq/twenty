import { SOURCE_TABLE_MAPPINGS } from '../constants/source-table-mapping';
import type { TargetObjectName } from '../types/mapped-source-record.type';

export type TargetObjectApiNames = {
  pluralApiName: string;
  createMutationName: string;
  updateMutationName: string;
};

const TARGET_OBJECT_API_NAMES: Record<TargetObjectName, TargetObjectApiNames> =
  Object.values(SOURCE_TABLE_MAPPINGS).reduce(
    (accumulator, mapping) => ({
      ...accumulator,
      [mapping.targetObject]: {
        pluralApiName: mapping.pluralApiName,
        createMutationName: mapping.createMutationName,
        updateMutationName: mapping.updateMutationName,
      },
    }),
    {} as Record<TargetObjectName, TargetObjectApiNames>,
  );

export const getTargetObjectApiNames = (
  targetObject: TargetObjectName,
): TargetObjectApiNames => TARGET_OBJECT_API_NAMES[targetObject];
