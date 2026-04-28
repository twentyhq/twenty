import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordRoadmapContextOrThrow } from '@/object-record/record-roadmap/contexts/RecordRoadmapContext';
import { useRelevantRecordsGqlFields } from '@/object-record/record-field/hooks/useRelevantRecordsGqlFields';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { FieldMetadataType } from 'twenty-shared/types';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRoadmapFieldBlockedByIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldBlockedByIdState';
import { recordIndexRoadmapFieldColorIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldColorIdState';
import { recordIndexRoadmapFieldEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldEndIdState';
import { recordIndexRoadmapFieldGroupIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldGroupIdState';
import { recordIndexRoadmapFieldLabelIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldLabelIdState';
import { recordIndexRoadmapFieldPlannedEndIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedEndIdState';
import { recordIndexRoadmapFieldPlannedStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldPlannedStartIdState';
import { recordIndexRoadmapFieldStartIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStartIdState';
import { recordIndexRoadmapFieldStatusIdState } from '@/object-record/record-index/states/recordIndexRoadmapFieldStatusIdState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

// Fase 3 MVP: fetch the object records and let the component layer figure out
// which ones can be placed on the timeline. A viewport-bounded filter is
// planned for the Fase 5 performance work; for ≤500 records this is fine.
export const useRecordRoadmapFetchRecords = () => {
  const { objectMetadataItem } = useRecordRoadmapContextOrThrow();

  const recordIndexRoadmapFieldStartId = useAtomStateValue(
    recordIndexRoadmapFieldStartIdState,
  );
  const recordIndexRoadmapFieldEndId = useAtomStateValue(
    recordIndexRoadmapFieldEndIdState,
  );
  const recordIndexRoadmapFieldGroupId = useAtomStateValue(
    recordIndexRoadmapFieldGroupIdState,
  );
  const recordIndexRoadmapFieldColorId = useAtomStateValue(
    recordIndexRoadmapFieldColorIdState,
  );
  const recordIndexRoadmapFieldLabelId = useAtomStateValue(
    recordIndexRoadmapFieldLabelIdState,
  );
  const recordIndexRoadmapFieldPlannedStartId = useAtomStateValue(
    recordIndexRoadmapFieldPlannedStartIdState,
  );
  const recordIndexRoadmapFieldPlannedEndId = useAtomStateValue(
    recordIndexRoadmapFieldPlannedEndIdState,
  );
  const recordIndexRoadmapFieldStatusId = useAtomStateValue(
    recordIndexRoadmapFieldStatusIdState,
  );
  const recordIndexRoadmapFieldBlockedById = useAtomStateValue(
    recordIndexRoadmapFieldBlockedByIdState,
  );
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  // Visible view-fields drive which columns the name column renders. Their
  // values must be in the GQL selection set or the cells render blank.
  const { currentView } = useGetCurrentViewOnly();
  const visibleViewFieldIds =
    currentView?.viewFields
      ?.filter((viewField) => viewField.isVisible)
      .map((viewField) => viewField.fieldMetadataId) ?? [];

  const relevantRecordGqlFields = useRelevantRecordsGqlFields({
    objectMetadataItem,
    additionalFieldMetadataId: recordIndexRoadmapFieldStartId,
  });

  // The shared `useRelevantRecordsGqlFields` only opts one "additional" field
  // into the selection set. The roadmap needs every configured field in the
  // response so bars render, swimlanes bucket by group, and the color dot
  // reads a value. Missing any of these used to collapse all records into
  // Uncategorized because `record[groupField.name]` was undefined.
  const roadmapFieldIds = [
    recordIndexRoadmapFieldEndId,
    recordIndexRoadmapFieldGroupId,
    recordIndexRoadmapFieldColorId,
    recordIndexRoadmapFieldLabelId,
    recordIndexRoadmapFieldPlannedStartId,
    recordIndexRoadmapFieldPlannedEndId,
    recordIndexRoadmapFieldStatusId,
    recordIndexRoadmapFieldBlockedById,
    recordIndexGroupFieldMetadataItem?.id,
    ...visibleViewFieldIds,
  ].filter(isDefined);

  const extraRoadmapFields = roadmapFieldIds
    .map((id) => objectMetadataItem.fields.find((field) => field.id === id))
    .filter(isDefined);

  // RELATION group fields need their nested `{id,name}` requested explicitly
  // so the swimlane hook can label each lane with the related record's name
  // (e.g. each Opportunity name when grouping milestones by `opportunity`).
  // Other field roles are scalars and resolve fine with the boolean shorthand.
  const recordGqlFields = {
    ...relevantRecordGqlFields,
    ...Object.fromEntries(
      extraRoadmapFields.map((field) => [
        field.name,
        field.type === FieldMetadataType.RELATION
          ? { id: true, name: true }
          : true,
      ]),
    ),
  };

  const { records, loading, error } = useFindManyRecords<ObjectRecord>({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
    skip: !recordIndexRoadmapFieldStartId || !recordIndexRoadmapFieldEndId,
  });

  const startFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexRoadmapFieldStartId,
  );
  const endFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordIndexRoadmapFieldEndId,
  );

  return {
    records,
    loading,
    error,
    startFieldMetadataItem,
    endFieldMetadataItem,
  };
};
