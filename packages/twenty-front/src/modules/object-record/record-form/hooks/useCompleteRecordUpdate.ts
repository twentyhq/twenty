import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getFieldPermissions } from '@/object-metadata/utils/getFieldPermissions';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordUpdateFormContextOrThrow } from '@/object-record/record-form/contexts/RecordUpdateFormContext';
import { computeRecordUpdateFieldsToComplete } from '@/object-record/record-form/utils/computeRecordUpdateFieldsToComplete';
import { isRecordPathLoaded } from '@/object-record/record-form/utils/isRecordPathLoaded';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useHasValidationRulesEntitlement } from '@/validation-rules/hooks/useHasValidationRulesEntitlement';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { useApolloClient } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import {
  compileValidationRuleExpression,
  getValidationRulePreviousValueFieldPath,
  isDefined,
} from 'twenty-shared/utils';
import { FindManyValidationRulesDocument } from '~/generated-metadata/graphql';

export const useCompleteRecordUpdate = ({
  objectMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
}) => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const hasValidationRulesEntitlement = useHasValidationRulesEntitlement();
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const { requestRecordUpdateFormCompletion } =
    useRecordUpdateFormContextOrThrow();
  const apolloCoreClient = useApolloCoreClient();
  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: objectMetadataItem.nameSingular,
    depth: 1,
    shouldOnlyLoadRelationIdentifiers: false,
  });
  const { findOneRecordQuery } = useFindOneRecordQuery({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
  });

  const fetchRecordWithRelations = useCallback(
    async (recordId: string): Promise<Partial<ObjectRecord> | null> => {
      const { data } = await apolloCoreClient.query<
        Record<string, RecordGqlNode>
      >({
        query: findOneRecordQuery,
        variables: { objectRecordId: recordId },
      });

      const recordNode = data?.[objectMetadataItem.nameSingular];

      return isDefined(recordNode)
        ? getRecordFromRecordNode({ recordNode })
        : null;
    },
    [apolloCoreClient, findOneRecordQuery, objectMetadataItem.nameSingular],
  );

  const completeRecordUpdate = useCallback(
    async ({
      recordId,
      updateInput,
      recordBeforeUpdate,
    }: {
      recordId: string;
      updateInput: Partial<ObjectRecord>;
      recordBeforeUpdate?: Partial<ObjectRecord>;
    }): Promise<Partial<ObjectRecord> | null> => {
      if (!hasValidationRulesEntitlement) {
        return updateInput;
      }

      try {
        const { data } = await apolloClient.query({
          query: FindManyValidationRulesDocument,
          variables: { objectMetadataId: objectMetadataItem.id },
        });

        const activeValidationRules = (data?.validationRules ?? []).filter(
          (validationRule) => validationRule.isActive,
        );

        if (activeValidationRules.length === 0) {
          return updateInput;
        }

        const fields = buildValidationRuleFieldDescriptors({
          objectMetadataItem,
          objectMetadataItems,
        });

        // A caller that already shows the new value in the store passes the record as it was
        const storedRecord =
          recordBeforeUpdate ??
          store.get(recordStoreFamilyState.atomFamily(recordId)) ??
          {};

        const bindingPathsReadByRules = activeValidationRules.flatMap(
          (validationRule) => {
            const compilationResult = compileValidationRuleExpression({
              expression: validationRule.expression,
              fields,
            });

            return compilationResult.isValid
              ? Object.keys(compilationResult.bindings)
              : [];
          },
        );

        const isEveryBindingPathLoadedIn = (record: Partial<ObjectRecord>) =>
          bindingPathsReadByRules.every((path) => {
            const previousValueFieldPath =
              getValidationRulePreviousValueFieldPath(path);

            // A previous value is read from the stored record alone, before the update
            if (isDefined(previousValueFieldPath)) {
              return isRecordPathLoaded({
                record,
                path: previousValueFieldPath,
              });
            }

            return isRecordPathLoaded({
              record: { ...record, ...updateInput },
              path,
            });
          });

        // Views load only the fields they show, so a rule may read one the store does not have yet
        const currentRecord = isEveryBindingPathLoadedIn(storedRecord)
          ? storedRecord
          : await fetchRecordWithRelations(recordId);

        // A value missing even from the fetched record cannot be checked here, so the server decides
        if (
          !isDefined(currentRecord) ||
          !isEveryBindingPathLoadedIn(currentRecord)
        ) {
          return updateInput;
        }

        const { draftRecord, fieldMetadataIds, violations } =
          computeRecordUpdateFieldsToComplete({
            validationRules: activeValidationRules,
            currentRecord,
            updateInput,
            fields,
            fieldMetadataItems: objectMetadataItem.fields,
            canUpdateField: (fieldMetadataId) =>
              getFieldPermissions({ objectPermissions, fieldMetadataId })
                .canUpdateField,
            now: new Date().toISOString(),
          });

        if (fieldMetadataIds.length === 0) {
          return updateInput;
        }

        const completedFields = await requestRecordUpdateFormCompletion({
          objectMetadataItem,
          draftRecord,
          previousRecord: currentRecord,
          fieldMetadataIds,
          violations,
        });

        return isDefined(completedFields)
          ? { ...updateInput, ...completedFields }
          : null;
      } catch {
        // The server enforces the rules either way, so a failed check just sends the update as is
        return updateInput;
      }
    },
    [
      apolloClient,
      fetchRecordWithRelations,
      hasValidationRulesEntitlement,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissions,
      requestRecordUpdateFormCompletion,
      store,
    ],
  );

  return { completeRecordUpdate };
};
