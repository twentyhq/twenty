import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';
import { isDefined } from 'twenty-shared/utils';

type RecordDetailRelationSectionProps = {
  relationObjectMetadataNameSingular: string;
  relationObjectMetadataItem: ObjectMetadataItem;
  relationFieldMetadataItem?: FieldMetadataItem;
  recordId: string;
};
export const useAddNewRecordAndOpenRightDrawer = ({
  relationObjectMetadataNameSingular,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  recordId,
}: RecordDetailRelationSectionProps) => {
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular:
      relationFieldMetadataItem?.relationDefinition?.targetObjectMetadata
        .nameSingular ?? 'workspaceMember',
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  if (
    relationObjectMetadataNameSingular === 'workspaceMember' ||
    !isDefined(
      relationFieldMetadataItem?.relationDefinition?.targetObjectMetadata
        .nameSingular,
    )
  ) {
    return {
      createNewRecordAndOpenRightDrawer: undefined,
    };
  }

  return {
    createNewRecordAndOpenRightDrawer: async (searchInput?: string) => {
      const newRecordId = v4();
      const labelIdentifierType = getLabelIdentifierFieldMetadataItem(
        relationObjectMetadataItem,
      )?.type;
      const createRecordPayload: {
        id: string;
        name:
          | string
          | { firstName: string | undefined; lastName: string | undefined };
        [key: string]: any;
      } =
        labelIdentifierType === FieldMetadataType.FULL_NAME
          ? {
              id: newRecordId,
              name:
                searchInput && searchInput.split(' ').length > 1
                  ? {
                      firstName: searchInput.split(' ')[0],
                      lastName: searchInput.split(' ').slice(1).join(' '),
                    }
                  : { firstName: searchInput, lastName: '' },
            }
          : { id: newRecordId, name: searchInput ?? '' };

      if (
        relationFieldMetadataItem?.relationDefinition?.direction ===
        RelationDefinitionType.MANY_TO_ONE
      ) {
        createRecordPayload[
          `${relationFieldMetadataItem?.relationDefinition?.sourceFieldMetadata.name}Id`
        ] = recordId;
      }

      await createOneRecord(createRecordPayload);

      if (
        relationFieldMetadataItem?.relationDefinition?.direction ===
        RelationDefinitionType.ONE_TO_MANY
      ) {
        await updateOneRecord({
          idToUpdate: recordId,
          updateOneRecordInput: {
            [`${relationFieldMetadataItem?.relationDefinition?.targetFieldMetadata.name}Id`]:
              newRecordId,
          },
        });
      }

      setViewableRecordId(newRecordId);
      setViewableRecordNameSingular(relationObjectMetadataNameSingular);

      openRecordInCommandMenu({
        recordId: newRecordId,
        objectNameSingular: relationObjectMetadataNameSingular,
      });
    },
  };
};
