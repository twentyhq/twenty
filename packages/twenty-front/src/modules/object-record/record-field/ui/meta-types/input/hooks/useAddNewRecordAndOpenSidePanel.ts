import { v4 } from 'uuid';

import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { draftRecordIdsState } from '@/object-record/record-side-panel/states/draftRecordIdsState';
import { viewableRecordIdState } from '@/object-record/record-side-panel/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-side-panel/states/viewableRecordNameSingularState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { getOperationName } from '~/utils/getOperationName';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { useStore } from 'jotai';

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
  const setViewableRecordId = useSetAtomState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetAtomState(
    viewableRecordNameSingularState,
  );

  const { updateOneRecord } = useUpdateOneRecord();

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const apolloCoreClient = useApolloCoreClient();

  const store = useStore();

  if (
    relationObjectMetadataNameSingular === 'workspaceMember' ||
    !isDefined(objectMetadataItem.nameSingular)
  ) {
    return {
      createNewRecordAndOpenSidePanel: undefined,
    };
  }

  const relationFieldMetadataItemRelationType =
    relationFieldMetadataItem.settings?.relationType;

  return {
    createNewRecordAndOpenSidePanel: (searchInput?: string) => {
      const newRecordId = v4();

      const labelPayload = buildRecordLabelPayload({
        id: newRecordId,
        searchInput,
        objectMetadataItem: relationObjectMetadataItem,
      });

      const seedValues: Record<string, unknown> = {
        id: newRecordId,
        ...labelPayload,
      };

      if (relationFieldMetadataItemRelationType === RelationType.MANY_TO_ONE) {
        const gqlField =
          relationFieldMetadataItem.type === FieldMetadataType.RELATION
            ? relationFieldMetadataItem.name
            : computeMorphRelationFieldName({
                fieldName: relationFieldMetadataItem.name,
                relationType: relationFieldMetadataItemRelationType,
                targetObjectMetadataNameSingular:
                  objectMetadataItem.nameSingular,
                targetObjectMetadataNamePlural: objectMetadataItem.namePlural,
              });

        seedValues[`${gqlField}Id`] = recordId;

        // Also set the relation object so the display renders the chip
        // (not just the FK). Read the source record from the store.
        const sourceRecord = store.get(
          recordStoreFamilyState.atomFamily(recordId),
        );
        if (isDefined(sourceRecord)) {
          seedValues[gqlField] = sourceRecord;
        }
      }

      // Seed draft in record store
      store.set(
        recordStoreFamilyState.atomFamily(newRecordId),
        seedValues as ObjectRecord,
      );

      // Track as draft
      const draftMap = new Map(store.get(draftRecordIdsState.atom));
      draftMap.set(newRecordId, {
        objectNameSingular: relationObjectMetadataNameSingular,
        objectMetadataItem: relationObjectMetadataItem,
        hiddenFieldNames: new Set(['position']),
        extraRecordInput: {},
        onRecordCreated: async (createdRecord) => {
          if (
            relationFieldMetadataItemRelationType === RelationType.ONE_TO_MANY
          ) {
            await updateOneRecord({
              objectNameSingular:
                objectMetadataItem.nameSingular ?? 'workspaceMember',
              idToUpdate: recordId,
              updateOneRecordInput: {
                [`${fieldMetadataItem.name}Id`]: createdRecord.id,
              },
            });
          }

          setViewableRecordId(createdRecord.id);
          setViewableRecordNameSingular(relationObjectMetadataNameSingular);

          apolloCoreClient.refetchQueries({
            include: [getOperationName(SEARCH_QUERY) ?? ''],
          });
        },
      });
      store.set(draftRecordIdsState.atom, draftMap);

      // Open side panel with draft
      openRecordInSidePanel({
        recordId: newRecordId,
        objectNameSingular: relationObjectMetadataNameSingular,
        isNewRecord: true,
      });
    },
  };
};
