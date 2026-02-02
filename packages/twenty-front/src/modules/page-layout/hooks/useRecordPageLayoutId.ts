import { FIND_PAGE_LAYOUTS } from '@/page-layout/graphql/queries/findPageLayouts';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getRecordPageLayoutId } from '@/page-layout/utils/getRecordPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { FeatureFlagKey, PageLayoutType } from '~/generated/graphql';

export const useRecordPageLayoutId = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { record } = useFindOneRecord<ObjectRecord & { pageLayoutId?: string }>(
    {
      objectNameSingular: targetObjectNameSingular,
      objectRecordId: id,
    },
  );

  const isRecordPageLayoutEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const { data: pageLayoutsData } = useQuery(FIND_PAGE_LAYOUTS, {
    variables: {
      objectMetadataId: objectMetadataItem.id,
    },
    skip: !isRecordPageLayoutEditingEnabled || !objectMetadataItem?.id,
  });

  const pageLayoutId = useMemo(() => {
    if (isRecordPageLayoutEditingEnabled) {
      const recordPageLayout = pageLayoutsData?.getPageLayouts?.find(
        (layout) => layout.type === PageLayoutType.RECORD_PAGE,
      );

      if (recordPageLayout) {
        return recordPageLayout.id;
      }
    }

    return getRecordPageLayoutId({
      record,
      targetObjectNameSingular,
    });
  }, [
    isRecordPageLayoutEditingEnabled,
    pageLayoutsData,
    record,
    targetObjectNameSingular,
  ]);

  return {
    pageLayoutId,
  };
};
