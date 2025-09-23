import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';

import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { useRecordShowContainerTabs } from '@/object-record/record-show/hooks/useRecordShowContainerTabs';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import React, { Suspense } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useTheme } from '@emotion/react';

const LazyShowPageSubContainer = React.lazy(() =>
  import('@/ui/layout/show-page/components/ShowPageSubContainer').then(
    (mod) => ({ default: mod.ShowPageSubContainer }),
  ),
);

const StyledShowPageBannerContainer = styled.div`
  z-index: 1;
`;

type RecordShowContainerProps = {
  objectNameSingular: string;
  objectRecordId: string;
  loading: boolean;
  isInRightDrawer?: boolean;
  isNewRightDrawerItemLoading?: boolean;
};

const StyledSkeletonWrapper = styled.div<{ theme: any }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const RecordShowSubcontainerSkeleton = () => {
  const theme = useTheme();

  return (
    <StyledSkeletonWrapper theme={theme}>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={theme.border.radius.sm}
      >
        <Skeleton height={28} width="35%" />

        <div style={{ display: 'flex', gap: theme.spacing(3) }}>
          <Skeleton height={32} width={70} />
          <Skeleton height={32} width={70} />
          <Skeleton height={32} width={70} />
        </div>

        <Skeleton height={160} width="100%" />
        <Skeleton height={160} width="100%" />
      </SkeletonTheme>
    </StyledSkeletonWrapper>
  );
};

export const RecordShowContainer = ({
  objectNameSingular,
  objectRecordId,
  loading,
  isInRightDrawer = false,
}: RecordShowContainerProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { isPrefetchLoading, recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const recordDeletedAt = useRecoilValue<string | null>(
    recordStoreFamilySelector({
      recordId: objectRecordId,
      fieldName: 'deletedAt',
    }),
  );

  const { layout, tabs } = useRecordShowContainerTabs(
    loading,
    objectNameSingular as CoreObjectNameSingular,
    isInRightDrawer,
    objectMetadataItem,
  );

  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <RecordShowContainerContextStoreTargetedRecordsEffect
        recordId={objectRecordId}
      />
      {recordDeletedAt && (
        <StyledShowPageBannerContainer>
          <InformationBannerDeletedRecord
            recordId={objectRecordId}
            objectNameSingular={objectNameSingular}
          />
        </StyledShowPageBannerContainer>
      )}
      <ShowPageContainer>
        <Suspense fallback={<RecordShowSubcontainerSkeleton />}>
          <LazyShowPageSubContainer
            tabs={tabs}
            layout={layout}
            targetableObject={{
              id: objectRecordId,
              targetObjectNameSingular: objectMetadataItem?.nameSingular,
            }}
            isInRightDrawer={isInRightDrawer}
            loading={isPrefetchLoading || loading || recordLoading}
          />
        </Suspense>
      </ShowPageContainer>
    </RightDrawerProvider>
  );
};
