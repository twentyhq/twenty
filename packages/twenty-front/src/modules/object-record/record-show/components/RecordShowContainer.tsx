import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';

import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { useRecordShowContainerTabs } from '@/object-record/record-show/hooks/useRecordShowContainerTabs';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { ShowPageSubContainer } from '@/ui/layout/show-page/components/ShowPageSubContainer';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledShowPageBannerContainer = styled.div`
  z-index: 1;
`;

type RecordShowContainerProps = {
  objectNameSingular: string;
  objectRecordId: string;
  isInRightDrawer?: boolean;
};

export const RecordShowContainer = ({
  objectNameSingular,
  objectRecordId,
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
        <ShowPageSubContainer
          tabs={tabs}
          layout={layout}
          targetRecordIdentifier={{
            id: objectRecordId,
            targetObjectNameSingular: objectMetadataItem?.nameSingular,
          }}
          isInRightDrawer={isInRightDrawer}
          loading={isPrefetchLoading || recordLoading}
        />
      </ShowPageContainer>
    </RightDrawerProvider>
  );
};
