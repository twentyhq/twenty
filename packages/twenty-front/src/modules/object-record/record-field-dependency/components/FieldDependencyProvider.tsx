import { type ReactNode, useCallback, useMemo } from 'react';
import { useStore } from 'jotai';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { FieldDependencyContext } from '@/object-record/record-field-dependency/contexts/FieldDependencyContext';
import { useCascadeClearDependentFields } from '@/object-record/record-field-dependency/hooks/useCascadeClearDependentFields';
import { computeFieldDependencyGraph } from '@/object-record/record-field-dependency/utils/computeFieldDependencyGraph';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

type FieldDependencyProviderProps = {
  objectNameSingular: string;
  recordId: string;
  children: ReactNode;
};

export const FieldDependencyProvider = ({
  objectNameSingular,
  recordId,
  children,
}: FieldDependencyProviderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const dependencyGraph = useMemo(
    () => computeFieldDependencyGraph(objectMetadataItem, objectMetadataItems),
    [objectMetadataItem, objectMetadataItems],
  );

  const store = useStore();

  const recordData = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  // Collect IDs of related records so we subscribe to their store state.
  // This ensures re-renders when related record data becomes available
  // (needed for reverse dependency lookups).
  const relatedRecordIds = useMemo(() => {
    if (!isDefined(recordData)) {
      return [];
    }

    const ids: string[] = [];

    for (const deps of Object.values(dependencyGraph.dependenciesByField)) {
      for (const dep of deps) {
        const parentValue = recordData[dep.parentFieldName] as
          | { id: string }
          | null
          | undefined;

        if (
          isDefined(parentValue) === true &&
          isDefined(parentValue.id) === true
        ) {
          ids.push(parentValue.id);
        }
      }
    }

    return [...new Set(ids)];
  }, [dependencyGraph.dependenciesByField, recordData]);

  // Subscribe to related records' state to trigger re-renders when
  // related record data loads (needed for reverse dependency lookups).
  useAtomFamilyStateValue(recordStoreFamilyState, relatedRecordIds[0] ?? '');
  useAtomFamilyStateValue(recordStoreFamilyState, relatedRecordIds[1] ?? '');
  useAtomFamilyStateValue(recordStoreFamilyState, relatedRecordIds[2] ?? '');
  useAtomFamilyStateValue(recordStoreFamilyState, relatedRecordIds[3] ?? '');

  const { clearDependentFields } = useCascadeClearDependentFields({
    objectNameSingular,
    recordId,
    dependencyGraph,
  });

  const getFilterForField = useCallback(
    (fieldName: string): ObjectRecordFilterInput | undefined => {
      const dependencies = dependencyGraph.dependenciesByField[fieldName];

      if (!isDefined(dependencies) || dependencies.length === 0) {
        return undefined;
      }

      const filters: (ObjectRecordFilterInput | undefined)[] =
        dependencies.map((dep) => {
          const parentValue = recordData?.[dep.parentFieldName] as
            | { id: string }
            | null
            | undefined;

          if (!isDefined(parentValue) || !isDefined(parentValue.id)) {
            return undefined;
          }

          if (dep.direction === 'forward') {
            return {
              [dep.bridgeFieldForeignKeyName]: { eq: parentValue.id },
            } as ObjectRecordFilterInput;
          }

          // Reverse: look up the parent record in the store to get bridge FK
          const parentRecord = store.get(
            recordStoreFamilyState.atomFamily(parentValue.id),
          );

          if (!isDefined(parentRecord)) {
            return undefined;
          }

          const fkValue = parentRecord[dep.bridgeFieldForeignKeyName] as
            | string
            | null
            | undefined;

          if (!isDefined(fkValue)) {
            return undefined;
          }

          return {
            id: { eq: fkValue },
          } as ObjectRecordFilterInput;
        });

      const definedFilters = filters.filter(
        (f): f is ObjectRecordFilterInput => isDefined(f),
      );

      if (definedFilters.length === 0) {
        return undefined;
      }

      if (definedFilters.length === 1) {
        return definedFilters[0];
      }

      return { and: definedFilters };
    },
    [dependencyGraph.dependenciesByField, recordData, store],
  );

  const contextValue = useMemo(
    () => ({
      getFilterForField,
      clearDependentFields,
    }),
    [getFilterForField, clearDependentFields],
  );

  return (
    <FieldDependencyContext.Provider value={contextValue}>
      {children}
    </FieldDependencyContext.Provider>
  );
};
