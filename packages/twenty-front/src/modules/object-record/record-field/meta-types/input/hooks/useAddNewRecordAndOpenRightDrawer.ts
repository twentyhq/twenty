import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { SEARCH_QUERY } from '@/command-menu/graphql/queries/search';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { getOperationName } from '@apollo/client/utilities';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

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
      relationFieldMetadataItem?.relation?.targetObjectMetadata.nameSingular ??
      'workspaceMember',
  });

  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const apolloCoreClient = useApolloCoreClient();

  if (
    relationObjectMetadataNameSingular === 'workspaceMember' ||
    !isDefined(
      relationFieldMetadataItem?.relation?.targetObjectMetadata.nameSingular,
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
        relationFieldMetadataItem?.relation?.type === RelationType.MANY_TO_ONE
      ) {
        createRecordPayload[
          `${relationFieldMetadataItem?.relation?.sourceFieldMetadata.name}Id`
        ] = recordId;
      }

      await createOneRecord(createRecordPayload);

      if (
        relationFieldMetadataItem?.relation?.type === RelationType.ONE_TO_MANY
      ) {
        await updateOneRecord({
          idToUpdate: recordId,
          updateOneRecordInput: {
            [`${relationFieldMetadataItem?.relation?.targetFieldMetadata.name}Id`]:
              newRecordId,
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
