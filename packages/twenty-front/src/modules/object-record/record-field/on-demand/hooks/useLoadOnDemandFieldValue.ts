import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getSessionGeneration } from '@/auth/utils/getSessionGeneration';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { type OnDemandFieldLoadResult } from '@/object-record/record-field/on-demand/types/OnDemandFieldLoadResult';
import { isOnDemandFieldResponseStale } from '@/object-record/record-field/on-demand/utils/isOnDemandFieldResponseStale';
import { runOnDemandFieldRequest } from '@/object-record/record-field/on-demand/utils/runOnDemandFieldRequest';
import { isFieldRawJsonValue } from '@/object-record/record-field/ui/types/guards/isFieldRawJsonValue';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindOneRecordQuery } from '@/object-record/utils/generateFindOneRecordQuery';
import { isNull } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { logError } from '~/utils/logError';

export const useLoadOnDemandFieldValue = () => {
  const client = useApolloCoreClient();
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const loadOnDemandFieldValue = useCallback(
    async ({
      objectNameSingular,
      recordId,
      fieldMetadataId,
    }: {
      objectNameSingular: string;
      recordId: string;
      fieldMetadataId: string;
    }): Promise<OnDemandFieldLoadResult> => {
      try {
        const workspace = store.get(currentWorkspaceState.atom);
        const member = store.get(currentWorkspaceMemberState.atom);
        const userWorkspace = store.get(currentUserWorkspaceState.atom);
        const sessionGeneration = getSessionGeneration();
        const objectMetadataSelector =
          objectMetadataItemFamilySelector.selectorFamily({
            objectName: objectNameSingular,
            objectNameType: 'singular',
          });
        const objectMetadataItem = store.get(objectMetadataSelector);
        const fieldMetadata = objectMetadataItem?.readableFields.find(
          (field) => field.id === fieldMetadataId && field.isActive,
        );

        if (
          !isDefined(workspace) ||
          !isDefined(member) ||
          !isDefined(userWorkspace) ||
          !isDefined(objectMetadataItem) ||
          !isDefined(fieldMetadata)
        ) {
          return 'forbidden';
        }

        if (fieldMetadata.type !== FieldMetadataType.RAW_JSON) {
          return 'error';
        }

        const isRequestCurrent = () =>
          store.get(currentWorkspaceState.atom)?.id === workspace.id &&
          store.get(currentWorkspaceMemberState.atom)?.id === member.id &&
          isDeeplyEqual(
            store.get(currentUserWorkspaceState.atom),
            userWorkspace,
          ) &&
          getSessionGeneration() === sessionGeneration;

        return await runOnDemandFieldRequest({
          store,
          requestKey: JSON.stringify([
            workspace.id,
            member.id,
            sessionGeneration,
            objectMetadataItem.id,
            recordId,
            fieldMetadataId,
          ]),
          requestOwner: userWorkspace,
          loadValue: async () => {
            if (!isRequestCurrent()) {
              return 'stale';
            }

            const recordAtom = recordStoreFamilyState.atomFamily(recordId);
            const recordAtRequest = store.get(recordAtom);

            try {
              const result = await client.query<
                Record<string, (ObjectRecord & { updatedAt?: string }) | null>
              >({
                query: generateFindOneRecordQuery({
                  objectMetadataItem,
                  objectMetadataItems: store.get(
                    objectMetadataItemsSelector.atom,
                  ),
                  objectPermissionsByObjectMetadataId: store.get(
                    objectPermissionsByObjectMetadataIdSelector.atom,
                  ),
                  recordGqlFields: {
                    id: true,
                    updatedAt: true,
                    [fieldMetadata.name]: true,
                  },
                }),
                variables: { objectRecordId: recordId },
                fetchPolicy: 'no-cache',
                // Apollo's query deduplication ignores session changes.
                context: { queryDeduplication: false },
              });

              if (!isRequestCurrent()) {
                return 'stale';
              }

              const currentFieldMetadata = store
                .get(objectMetadataSelector)
                ?.readableFields.find(
                  (field) => field.id === fieldMetadataId && field.isActive,
                );

              if (!isDefined(currentFieldMetadata)) {
                return 'forbidden';
              }

              if (
                currentFieldMetadata.name !== fieldMetadata.name ||
                currentFieldMetadata.type !== fieldMetadata.type ||
                currentFieldMetadata.settings?.isValueLoadedOnOpen !==
                  fieldMetadata.settings?.isValueLoadedOnOpen
              ) {
                return 'stale';
              }

              const responseRecord = result.data?.[objectNameSingular];

              if (isNull(responseRecord)) {
                return 'missing';
              }

              if (
                !isDefined(responseRecord) ||
                responseRecord.id !== recordId ||
                !Object.hasOwn(responseRecord, fieldMetadata.name) ||
                !isFieldRawJsonValue(responseRecord[fieldMetadata.name])
              ) {
                return 'error';
              }

              if (
                isOnDemandFieldResponseStale({
                  recordAtRequest,
                  currentRecord: store.get(recordAtom),
                  responseUpdatedAt: responseRecord.updatedAt,
                  fieldName: fieldMetadata.name,
                })
              ) {
                return 'stale';
              }

              upsertRecordsInStore({
                partialRecords: [
                  {
                    id: recordId,
                    __typename: responseRecord.__typename,
                    [fieldMetadata.name]: responseRecord[fieldMetadata.name],
                  },
                ],
                recordGqlFields: { [fieldMetadata.name]: true },
              });

              return 'loaded';
            } catch (error) {
              if (!isRequestCurrent()) {
                return 'stale';
              }

              if (
                isGraphqlErrorOfType(error, 'FORBIDDEN') ||
                isGraphqlErrorOfType(error, 'UNAUTHENTICATED')
              ) {
                return 'forbidden';
              }

              if (isGraphqlErrorOfType(error, 'NOT_FOUND')) {
                return 'missing';
              }

              logError(error);

              return 'error';
            }
          },
        });
      } catch (error) {
        logError(error);

        return 'error';
      }
    },
    [client, store, upsertRecordsInStore],
  );

  return { loadOnDemandFieldValue };
};
