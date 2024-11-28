import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { hasPositionField } from '@/object-metadata/utils/hasPositionField';
import { recordBoardVisibleFieldDefinitionsComponentSelector } from '@/object-record/record-board/states/selectors/recordBoardVisibleFieldDefinitionsComponentSelector';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from '~/utils/isDefined';

export const useRecordBoardRecordGqlFields = ({
  objectMetadataItem,
  recordBoardId,
}: {
  recordBoardId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const visibleFieldDefinitions = useRecoilComponentValueV2(
    recordBoardVisibleFieldDefinitionsComponentSelector,
    recordBoardId,
  );

  const { imageIdentifierFieldMetadataItem, labelIdentifierFieldMetadataItem } =
    getObjectMetadataIdentifierFields({ objectMetadataItem });

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
    recordBoardId,
  );

  const identifierQueryFields: Record<string, boolean> = {};

  if (isDefined(labelIdentifierFieldMetadataItem)) {
    identifierQueryFields[labelIdentifierFieldMetadataItem.name] = true;
  }

  if (isDefined(imageIdentifierFieldMetadataItem)) {
    identifierQueryFields[imageIdentifierFieldMetadataItem.name] = true;
  }

  const recordGqlFields: Record<string, any> = {
    id: true,
    deletedAt: true,
    ...Object.fromEntries(
      visibleFieldDefinitions.map((visibleFieldDefinition) => [
        visibleFieldDefinition.metadata.fieldName,
        true,
      ]),
    ),
    ...(hasPositionField(objectMetadataItem) ? { position: true } : undefined),
    ...identifierQueryFields,
    noteTargets: {
      note: {
        id: true,
        title: true,
      },
    },
    taskTargets: {
      task: {
        id: true,
        title: true,
      },
    },
  };

  if (isDefined(recordGroupFieldMetadata?.name)) {
    recordGqlFields[recordGroupFieldMetadata.name] = true;
  }

  return recordGqlFields;
};
