import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { getOperationName } from '@apollo/client/utilities';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type useAddNewRecordAndOpenRightDrawerProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
  relationObjectMetadataNameSingular: string;
  relationObjectMetadataItem: ObjectMetadataItem;
  relationFieldMetadataItem: FieldMetadataItem;
  recordId: string;
};

export const useAddNewRecordAndOpenRightDrawer = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataNameSingular,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  recordId,
}: useAddNewRecordAndOpenRightDrawerProps) => {
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const apolloCoreClient = useApolloCoreClient();

  if (
    relationObjectMetadataNameSingular === 'workspaceMember' ||
    !isDefined(objectMetadataItem.nameSingular)
  ) {
    return {
      createNewRecordAndOpenRightDrawer: undefined,
    };
  }
  const relationFieldMetadataItemRelationType =
    relationFieldMetadataItem.settings?.relationType;

  return {
    createNewRecordAndOpenRightDrawer: async (searchInput?: string) => {
      const newRecordId = v4();

      const createRecordPayload = buildRecordLabelPayload({
        id: newRecordId,
        searchInput,
        objectMetadataItem: relationObjectMetadataItem,
      });

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

        createRecordPayload[`${gqlField}Id`] = recordId;
      }

      await createOneRecord(createRecordPayload);

      if (relationFieldMetadataItemRelationType === RelationType.ONE_TO_MANY) {
        await updateOneRecord({
          objectNameSingular:
            objectMetadataItem.nameSingular ?? 'workspaceMember',
          idToUpdate: recordId,
          updateOneRecordInput: {
            [`${fieldMetadataItem.name}Id`]: newRecordId,
          },
        });
      }

      setViewableRecordId(newRecordId);
      setViewableRecordNameSingular(relationObjectMetadataNameSingular);

      apolloCoreClient.refetchQueries({
        include: [getOperationName(SEARCH_QUERY) ?? ''],
      });

      openRecordInCommandMenu({
        recordId: newRecordId,
        objectNameSingular: relationObjectMetadataNameSingular,
      });

      return newRecordId;
    },
  };
};
