import { useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { useRightDrawer } from '@/ui/layout/right-drawer/hooks/useRightDrawer';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

type RecordDetailRelationSectionProps = {
  relationObjectMetadataNameSingular: string;
  relationObjectMetadataItem: ObjectMetadataItem;
  relationFieldMetadataItem?: FieldMetadataItem;
  entityId?: string;
};
export const useAddNewRecordAnOpenPanel = ({
  relationObjectMetadataNameSingular,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  entityId,
}: RecordDetailRelationSectionProps) => {
  const setViewableRecordId = useSetRecoilState(viewableRecordIdState);
  const setViewableRecordNameSingular = useSetRecoilState(
    viewableRecordNameSingularState,
  );

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { openRightDrawer } = useRightDrawer();

  const handleOnCreate =
    relationObjectMetadataNameSingular !== 'workspaceMember'
      ? async (searchInput?: string) => {
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
            labelIdentifierType === FieldMetadataType.FullName
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

          if (isDefined(entityId)) {
            createRecordPayload[
              `${relationFieldMetadataItem?.relationDefinition?.sourceFieldMetadata.name}Id`
            ] = entityId;
          }
          await createOneRecord(createRecordPayload);
          setViewableRecordId(newRecordId);
          setViewableRecordNameSingular(relationObjectMetadataNameSingular);
          openRightDrawer(RightDrawerPages.ViewRecord);
        }
      : undefined;

  return { handleOnCreate };
};
