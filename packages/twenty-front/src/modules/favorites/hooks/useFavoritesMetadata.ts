import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useFavoritesMetadata = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular(allowRequestsToTwentyIcons);

  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });

  const favoriteRelationFields = favoriteObjectMetadataItem.fields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION &&
      fieldMetadataItem.name !== 'forWorkspaceMember' &&
      fieldMetadataItem.name !== 'favoriteFolder',
  );

  return {
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  };
};
