import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordsFieldVisibleGqlFields } from '@/object-record/record-field/hooks/useRecordsFieldVisibleGqlFields';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { SIGN_IN_BACKGROUND_MOCK_COMPANIES } from '@/sign-in-background-mock/constants/SignInBackgroundMockCompanies';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';

export const useRecordIndexTableQuery = (objectNameSingular: string) => {
  const showAuthModal = useShowAuthModal();

  const params = useFindManyRecordIndexTableParams(objectNameSingular);

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const recordGqlFields = useRecordsFieldVisibleGqlFields({
    objectMetadataItem,
  });

  const { records, hasNextPage, queryIdentifier, loading, totalCount } =
    useFindManyRecords({
      ...params,
      recordGqlFields,
      skip: showAuthModal,
    });

  return {
    records: showAuthModal ? SIGN_IN_BACKGROUND_MOCK_COMPANIES : records,
    loading: showAuthModal ? false : loading,
    hasNextPage,
    queryIdentifier,
    totalCount,
  };
};
