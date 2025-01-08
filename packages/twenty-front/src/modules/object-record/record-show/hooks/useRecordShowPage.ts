import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useIcons } from 'twenty-ui';

import { useCreateFavorite } from '@/favorites/hooks/useCreateFavorite';
import { useDeleteFavorite } from '@/favorites/hooks/useDeleteFavorite';
import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { capitalize } from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const useRecordShowPage = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const {
    objectNameSingular: paramObjectNameSingular,
    objectRecordId: paramObjectRecordId,
  } = useParams();

  const objectNameSingular = propsObjectNameSingular ?? paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId ?? paramObjectRecordId;

  if (!isDefined(objectNameSingular) || !isDefined(objectRecordId)) {
    throw new Error('Object name or Record id is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({ objectNameSingular });
  const { sortedFavorites: favorites } = useFavorites();
  const { createFavorite } = useCreateFavorite();
  const { deleteFavorite } = useDeleteFavorite();
  const setEntityFields = useSetRecoilState(
    recordStoreFamilyState(objectRecordId),
  );
  const { getIcon } = useIcons();
  const headerIcon = getIcon(objectMetadataItem?.icon);
  const FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE =
    buildFindOneRecordForShowPageOperationSignature({
      objectMetadataItem,
      objectMetadataItems,
    });

  const { record, loading } = useFindOneRecord({
    objectRecordId,
    objectNameSingular,
    recordGqlFields: FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE.fields,
    withSoftDeleted: true,
  });

  useEffect(() => {
    if (isDefined(record)) {
      setEntityFields(record);
    }
  }, [record, setEntityFields]);

  const correspondingFavorite = favorites.find(
    (favorite) => favorite.recordId === objectRecordId,
  );
  const isFavorite = isDefined(correspondingFavorite);

  const handleFavoriteButtonClick = async () => {
    if (!objectNameSingular || !record) return;

    if (isFavorite) {
      deleteFavorite(correspondingFavorite.id);
    } else {
      createFavorite(record, objectNameSingular);
    }
  };

  const labelIdentifierFieldValue =
    record?.[labelIdentifierFieldMetadataItem?.name ?? ''];
  const pageName =
    labelIdentifierFieldMetadataItem?.type === FieldMetadataType.FullName
      ? [
          labelIdentifierFieldValue?.firstName,
          labelIdentifierFieldValue?.lastName,
        ].join(' ')
      : isDefined(labelIdentifierFieldValue)
        ? `${labelIdentifierFieldValue}`
        : '';

  const pageTitle = pageName.trim()
    ? `${pageName} - ${capitalize(objectNameSingular)}`
    : capitalize(objectNameSingular);

  return {
    objectNameSingular,
    objectRecordId,
    headerIcon,
    loading,
    pageTitle,
    pageName,
    isFavorite,
    record,
    objectMetadataItem,
    handleFavoriteButtonClick,
  };
};
