import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { useIcons } from 'twenty-ui';

import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { RecordShowContainer } from '@/object-record/record-show/components/RecordShowContainer';
import { findOneRecordForShowPageOperationSignatureFactory } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { RecordFieldValueSelectorContextProvider } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageFavoriteButton } from '@/ui/layout/page/PageFavoriteButton';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { ShowPageAddButton } from '@/ui/layout/show-page/components/ShowPageAddButton';
import { ShowPageMoreButton } from '@/ui/layout/show-page/components/ShowPageMoreButton';
import { PageTitle } from '@/ui/utilities/page-title/PageTitle';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';
import { capitalize } from '~/utils/string/capitalize';

export const RecordShowPage = () => {
  const { objectNameSingular, objectRecordId } = useParams<{
    objectNameSingular: string;
    objectRecordId: string;
  }>();

  if (!objectNameSingular) {
    throw new Error(`Object name is not defined`);
  }

  if (!objectRecordId) {
    throw new Error(`Record id is not defined`);
  }

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const { favorites, createFavorite, deleteFavorite } = useFavorites();

  const setEntityFields = useSetRecoilState(
    recordStoreFamilyState(objectRecordId),
  );

  const { getIcon } = useIcons();

  const headerIcon = getIcon(objectMetadataItem?.icon);

  const FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE =
    findOneRecordForShowPageOperationSignatureFactory({ objectMetadataItem });

  const { record, loading } = useFindOneRecord({
    objectRecordId,
    objectNameSingular,
    recordGqlFields: FIND_ONE_RECORD_FOR_SHOW_PAGE_OPERATION_SIGNATURE.fields,
  });

  useEffect(() => {
    if (!record) {
      return;
    }

    setEntityFields(record);
  }, [record, setEntityFields]);

  const correspondingFavorite = favorites.find(
    (favorite) => favorite.recordId === objectRecordId,
  );

  const isFavorite = isDefined(correspondingFavorite);

  const handleFavoriteButtonClick = async () => {
    if (!objectNameSingular || !record) return;

    if (isFavorite && isDefined(record)) {
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

  return (
    <RecordFieldValueSelectorContextProvider>
      <RecordValueSetterEffect recordId={objectRecordId} />
      <PageContainer>
        <PageTitle title={pageTitle} />
        <PageHeader
          title={pageName ?? ''}
          hasBackButton
          Icon={headerIcon}
          loading={loading}
        >
          <>
            <PageFavoriteButton
              isFavorite={isFavorite}
              onClick={handleFavoriteButtonClick}
            />
            <ShowPageAddButton
              key="add"
              activityTargetObject={{
                id: record?.id ?? '0',
                targetObjectNameSingular: objectMetadataItem?.nameSingular,
              }}
            />
            <ShowPageMoreButton
              key="more"
              recordId={record?.id ?? '0'}
              objectNameSingular={objectNameSingular}
            />
          </>
        </PageHeader>
        <PageBody>
          <RecordShowContainer
            objectNameSingular={objectNameSingular}
            objectRecordId={objectRecordId}
            loading={loading}
          />
        </PageBody>
      </PageContainer>
    </RecordFieldValueSelectorContextProvider>
  );
};
