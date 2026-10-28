import { v4 } from 'uuid';

import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRelationIdFieldNames } from '@/object-metadata/utils/getRelationIdFieldNames';
import { useBuildRecordInputFromRLSPredicates } from '@/object-record/hooks/useBuildRecordInputFromRLSPredicates';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordCreationForm } from '@/object-record/record-form/hooks/useRecordCreationForm';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { getOperationName } from '~/utils/getOperationName';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type useAddNewRecordAndOpenSidePanelProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  relationObjectMetadataNameSingular: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationFieldMetadataItem: FieldMetadataItem;
  recordId: string;
};

export const useAddNewRecordAndOpenSidePanel = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataNameSingular,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  recordId,
}: useAddNewRecordAndOpenSidePanelProps) => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const { buildRecordInputFromRLSPredicates } =
    useBuildRecordInputFromRLSPredicates({
      objectMetadataItem: relationObjectMetadataItem,
    });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { createRecordWithOptionalForm } = useRecordCreationForm();

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

  const getSourceRecordLink = () => {
    if (relationFieldMetadataItemRelationType !== RelationType.MANY_TO_ONE) {
      return {};
    }

    if (relationFieldMetadataItem.type === FieldMetadataType.MORPH_RELATION) {
      return {
        [relationFieldMetadataItem.name]: {
          targetObjectMetadataId: objectMetadataItem.id,
          id: recordId,
        },
      };
    }

    return {
      [doNotTranslate(`${relationFieldMetadataItem.name}Id`)]: recordId,
    };
  };

  return {
    createNewRecordAndOpenSidePanel: async (searchInput?: string) => {
      let recordAwaitingAttachment:
        | { record: ObjectRecord; recordInput: Partial<ObjectRecord> }
        | undefined;
      const saveRecord = async (recordInput: Partial<ObjectRecord>) => {
        if (!isDefined(recordAwaitingAttachment)) {
          return createOneRecord({ ...recordInput, id: v4() });
        }

        const { record, recordInput: previousRecordInput } =
          recordAwaitingAttachment;

        if (isDeeplyEqual(recordInput, previousRecordInput)) {
          return record;
        }

        const updateRecordInput = { ...recordInput };
        const morphRelationIdFieldNames = relationObjectMetadataItem.fields
          .filter(({ type }) => type === FieldMetadataType.MORPH_RELATION)
          .flatMap(getRelationIdFieldNames);

        for (const relationIdFieldName of morphRelationIdFieldNames) {
          if (
            isDefined(previousRecordInput[relationIdFieldName]) &&
            !isDefined(recordInput[relationIdFieldName])
          ) {
            updateRecordInput[relationIdFieldName] = null;
          }
        }

        await updateOneRecord({
          objectNameSingular: relationObjectMetadataNameSingular,
          idToUpdate: record.id,
          updateOneRecordInput: updateRecordInput,
        });

        return { ...record, ...updateRecordInput };
      };

      const createAndAttachRecord = async (
        draftRecord: Partial<ObjectRecord>,
      ) => {
        const recordInput = removePropertiesFromRecord(draftRecord, ['id']);
        const createdRecord = await saveRecord(recordInput);

        if (shouldAttachToSourceRecord) {
          recordAwaitingAttachment = { record: createdRecord, recordInput };
          await updateOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
            idToUpdate: recordId,
            updateOneRecordInput: {
              [doNotTranslate(`${fieldMetadataItem.name}Id`)]: createdRecord.id,
            },
          });
          recordAwaitingAttachment = undefined;
        }

        apolloCoreClient.refetchQueries({
          include: [getOperationName(SEARCH_QUERY) ?? ''],
        });

        return createdRecord;
      };

      const createdRecord = await createRecordWithOptionalForm({
        objectMetadataItem: relationObjectMetadataItem,
        initialDraftRecord: {
          ...buildRecordInputFromRLSPredicates(),
          ...buildRecordLabelPayload({
            searchInput,
            objectMetadataItem: relationObjectMetadataItem,
          }),
          ...getSourceRecordLink(),
        },
        canCreateAnother: !shouldAttachToSourceRecord,
        createRecord: createAndAttachRecord,
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
