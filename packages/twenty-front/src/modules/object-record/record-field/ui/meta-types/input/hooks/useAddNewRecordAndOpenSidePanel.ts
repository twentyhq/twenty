import { isNonEmptyString } from '@sniptt/guards';
import { v4 } from 'uuid';

import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { buildRecordInputFromFilter } from '@/object-record/record-table/utils/buildRecordInputFromFilter';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { buildSourceRecordLink } from '@/object-record/record-field/ui/meta-types/input/utils/buildSourceRecordLink';
import { createRecordWithAttachmentHandler } from '@/object-record/record-field/ui/meta-types/input/utils/createRecordWithAttachmentHandler';
import { useRecordCreationForm } from '@/object-record/record-form/hooks/useRecordCreationForm';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { getOperationName } from '~/utils/getOperationName';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

type useAddNewRecordAndOpenSidePanelProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  relationObjectMetadataNameSingular: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationFieldMetadataItem: FieldMetadataItem;
  recordId: string;
  prefillRecordFilters?: RecordFilter[];
};

export const useAddNewRecordAndOpenSidePanel = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataNameSingular,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  recordId,
  prefillRecordFilters = [],
}: useAddNewRecordAndOpenSidePanelProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { userTimezone } = useUserTimezone();

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem: relationObjectMetadataItem,
    });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { requestRecordCreation } = useRecordCreationForm();

  const apolloCoreClient = useApolloCoreClient();

  const relationObjectPermissions = useObjectPermissionsForObject(
    relationObjectMetadataItem.id,
  );

  if (
    !canCreateRecordsForObjectMetadataItem({
      objectPermissions: relationObjectPermissions,
      objectMetadataItem: relationObjectMetadataItem,
    }) ||
    !isDefined(objectMetadataItem.nameSingular)
  ) {
    return {
      createNewRecordAndOpenSidePanel: undefined,
    };
  }
  const relationFieldMetadataItemRelationType =
    relationFieldMetadataItem.settings?.relationType;
  const shouldAttachToSourceRecord =
    relationFieldMetadataItemRelationType === RelationType.ONE_TO_MANY;

  return {
    createNewRecordAndOpenSidePanel: async (searchInput?: string) => {
      const attachRecord = async (targetRecordId: string) => {
        await updateOneRecord({
          objectNameSingular: objectMetadataItem.nameSingular,
          idToUpdate: recordId,
          updateOneRecordInput: {
            [computeRelationGqlFieldJoinColumnName({
              name: fieldMetadataItem.name,
            })]: targetRecordId,
          },
        });
      };

      const saveRecordWithAttachment = createRecordWithAttachmentHandler({
        fieldMetadataItems: relationObjectMetadataItem.fields,
        createRecord: (recordInput) =>
          createOneRecord({ ...recordInput, id: v4() }),
        updateRecord: async ({ recordId: targetRecordId, recordInput }) => {
          await updateOneRecord({
            objectNameSingular: relationObjectMetadataNameSingular,
            idToUpdate: targetRecordId,
            updateOneRecordInput: recordInput,
          });
        },
        attachRecord: shouldAttachToSourceRecord ? attachRecord : undefined,
      });

      const recordLabelPayload = buildRecordLabelPayload({
        searchInput,
        objectMetadataItem: relationObjectMetadataItem,
      });

      const createdRecord = await requestRecordCreation({
        objectMetadataItem: relationObjectMetadataItem,
        initialDraftRecord: {
          ...recordLabelPayload,
          ...buildRecordInputFromFilter({
            currentRecordFilters: prefillRecordFilters,
            objectMetadataItem: relationObjectMetadataItem,
            currentWorkspaceMember: currentWorkspaceMember ?? undefined,
            timeZone: userTimezone,
          }),
          ...buildRecordInputFromRLSPredicates(),
          ...(isNonEmptyString(searchInput) ? recordLabelPayload : {}),
          ...buildSourceRecordLink({
            relationFieldMetadataItem,
            sourceObjectMetadataId: objectMetadataItem.id,
            sourceRecordId: recordId,
          }),
        },
        canCreateAnother: !shouldAttachToSourceRecord,
        createRecord: async (draftRecord) => {
          const createdRecord = await saveRecordWithAttachment(draftRecord);

          apolloCoreClient.refetchQueries({
            include: [getOperationName(SEARCH_QUERY) ?? ''],
          });

          return createdRecord;
        },
      });

      if (!isDefined(createdRecord)) {
        return undefined;
      }

      openRecordInSidePanel({
        recordId: createdRecord.id,
        objectNameSingular: relationObjectMetadataNameSingular,
      });

      return createdRecord.id;
    },
  };
};
