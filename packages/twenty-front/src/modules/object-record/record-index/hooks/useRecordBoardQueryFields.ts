import { useRecoilValue } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectMetadataIdentifierFields } from '@/object-metadata/utils/getObjectMetadataIdentifierFields';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { isDefined } from '~/utils/isDefined';

export const useRecordBoardQueryFields = ({
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

  const queryFields: Record<string, any> = {
    id: true,
    ...Object.fromEntries(
      visibleFieldDefinitions.map((visibleFieldDefinition) => [
        visibleFieldDefinition.metadata.fieldName,
        true,
      ]),
    ),
    ...identifierQueryFields,
  };

  if (isDefined(kanbanFieldMetadataName)) {
    queryFields[kanbanFieldMetadataName] = true;
  }

  return queryFields;
};
