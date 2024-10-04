import { useRecoilValue } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { hasPositionField } from '@/object-metadata/utils/hasPositionField';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { isDefined } from '~/utils/isDefined';

export const useRecordBoardRecordGqlFields = ({
  objectMetadataItem,
  recordBoardId,
}: {
  recordBoardId: string;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const { kanbanFieldMetadataNameState, visibleFieldDefinitionsState } =
    useRecordBoardStates(recordBoardId);

  const { imageIdentifierFieldMetadataItem, labelIdentifierFieldMetadataItem } =
    getObjectMetadataIdentifierFields({ objectMetadataItem });

  const kanbanFieldMetadataName = useRecoilValue(kanbanFieldMetadataNameState);
  const visibleFieldDefinitions = useRecoilValue(
    visibleFieldDefinitionsState(),
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

  if (isDefined(kanbanFieldMetadataName)) {
    recordGqlFields[kanbanFieldMetadataName] = true;
  }

  return recordGqlFields;
};
