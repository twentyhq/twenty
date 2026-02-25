import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getDefaultRecordPageLayoutId } from '@/page-layout/utils/getDefaultRecordPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { isDefined } from 'twenty-shared/utils';

export const usePageLayoutIdForRecord = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const isDashboard =
    targetObjectNameSingular === CoreObjectNameSingular.Dashboard;

  const { record } = useFindOneRecord<ObjectRecord & { pageLayoutId?: string }>(
    {
      objectNameSingular: targetObjectNameSingular,
      objectRecordId: id,
      withSoftDeleted: true,
      skip: !isDashboard,
    },
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const recordPageLayout = useAtomFamilySelectorValue(
    recordPageLayoutByObjectMetadataIdFamilySelector,
    { objectMetadataId: objectMetadataItem.id },
  );

  if (isDashboard) {
    return {
      pageLayoutId: record?.pageLayoutId ?? null,
    };
  }

  const pageLayoutId = isDefined(recordPageLayout)
    ? recordPageLayout.id
    : getDefaultRecordPageLayoutId({ targetObjectNameSingular });

  return {
    pageLayoutId,
  };
};
