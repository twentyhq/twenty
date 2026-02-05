import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { FIND_PAGE_LAYOUTS } from '@/page-layout/graphql/queries/findPageLayouts';
import { getRecordPageLayoutId } from '@/page-layout/utils/getRecordPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FeatureFlagKey,
  type GetPageLayoutsQuery,
  type GetPageLayoutsQueryVariables,
  PageLayoutType,
} from '~/generated/graphql';

export const useRecordPageLayoutId = ({
  targetObjectNameSingular,
}: Pick<TargetRecordIdentifier, 'targetObjectNameSingular'>) => {
  const isRecordPageLayoutEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_PAGE_LAYOUT_EDITING_ENABLED,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetObjectNameSingular,
  });

  const { data: pageLayoutsData, loading: pageLayoutsLoading } = useQuery<
    GetPageLayoutsQuery,
    GetPageLayoutsQueryVariables
  >(FIND_PAGE_LAYOUTS, {
    variables: {
      objectMetadataId: objectMetadataItem?.id,
      pageLayoutType: PageLayoutType.RECORD_PAGE,
    },
    skip:
      !isRecordPageLayoutEditingEnabled ||
      !objectMetadataItem ||
      !objectMetadataItem.id,
  });

  const pageLayoutId = useMemo(() => {
    if (isRecordPageLayoutEditingEnabled) {
      if (pageLayoutsLoading) {
        return null;
      }

      const recordPageLayout = pageLayoutsData?.getPageLayouts?.[0];

      if (isDefined(recordPageLayout)) {
        return recordPageLayout.id;
      }
    }

    return getRecordPageLayoutId({
      targetObjectNameSingular,
    });
  }, [
    isRecordPageLayoutEditingEnabled,
    pageLayoutsLoading,
    pageLayoutsData,
    targetObjectNameSingular,
  ]);

  return {
    pageLayoutId,
  };
};
