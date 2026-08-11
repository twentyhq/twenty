import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DEFAULT_RECORD_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultRecordPageLayoutId';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { CoreObjectNameSingular } from 'twenty-shared/types';
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

  const metadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'pageLayouts',
  );

  if (isDashboard) {
    return {
      pageLayoutId: record?.pageLayoutId ?? null,
    };
  }

  if (isDefined(recordPageLayout)) {
    return {
      pageLayoutId: recordPageLayout.id,
    };
  }

  // Last-resort net for objects without a record-page layout in the database.
  // Gated on the store having loaded so objects with a real layout never
  // flash the fallback while page layouts are still streaming in.
  const arePageLayoutsLoaded = metadataStore.status !== 'empty';

  return {
    pageLayoutId: arePageLayoutsLoaded ? DEFAULT_RECORD_PAGE_LAYOUT_ID : null,
  };
};
