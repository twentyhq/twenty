import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getDefaultRecordPageLayoutId } from '@/page-layout/utils/getDefaultRecordPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const useRecordPageLayoutIdFromRecordStoreOrThrow = ({
  targetObjectNameSingular,
}: Omit<TargetRecordIdentifier, 'id'>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const recordPageLayout = useRecoilValue(
    recordPageLayoutByObjectMetadataIdFamilySelector({
      objectMetadataId: objectMetadataItem.id,
    }),
  );

  const pageLayoutId = isDefined(recordPageLayout)
    ? recordPageLayout.id
    : getDefaultRecordPageLayoutId({ targetObjectNameSingular });

  return {
    pageLayoutId,
  };
};
