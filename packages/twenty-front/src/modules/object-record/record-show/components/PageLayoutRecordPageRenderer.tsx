import { RecordShowRightDrawerActionMenu } from '@/action-menu/components/RecordShowRightDrawerActionMenu';
import { RecordShowRightDrawerOpenRecordButton } from '@/action-menu/components/RecordShowRightDrawerOpenRecordButton';
import { InformationBannerDeletedRecord } from '@/information-banner/components/deleted-record/InformationBannerDeletedRecord';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordShowContainerContextStoreTargetedRecordsEffect } from '@/object-record/record-show/components/RecordShowContainerContextStoreTargetedRecordsEffect';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { PageLayoutRenderer } from '@/page-layout/components/PageLayoutRenderer';
import { useRecordPageLayoutId } from '@/page-layout/hooks/useRecordPageLayoutId';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { RightDrawerFooter } from '@/ui/layout/right-drawer/components/RightDrawerFooter';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated/graphql';

const StyledShowPageBannerContainer = styled.div`
  z-index: 1;
`;

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  width: 100%;
  overflow: auto;
`;

const StyledContentContainer = styled.div<{ isInRightDrawer: boolean }>`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.background.primary};
  padding-bottom: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.spacing(16) : 0};
`;

export const PageLayoutRecordPageRenderer = ({
  targetRecordIdentifier,
  isInRightDrawer,
}: {
  targetRecordIdentifier: TargetRecordIdentifier;
  isInRightDrawer: boolean;
}) => {
  const recordDeletedAt = useRecoilValue<string | null>(
    recordStoreFamilySelector({
      recordId: targetRecordIdentifier.id,
      fieldName: 'deletedAt',
    }),
  );

  const { pageLayoutId } = useRecordPageLayoutId({
    id: targetRecordIdentifier.id,
    targetObjectNameSingular: targetRecordIdentifier.targetObjectNameSingular,
  });

  return (
    <>
      <RecordShowEffect
        objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
        recordId={targetRecordIdentifier.id}
      />

      <RecordShowContainerContextStoreTargetedRecordsEffect
        recordId={targetRecordIdentifier.id}
      />

      {recordDeletedAt && (
        <StyledShowPageBannerContainer>
          <InformationBannerDeletedRecord
            recordId={targetRecordIdentifier.id}
            objectNameSingular={targetRecordIdentifier.targetObjectNameSingular}
          />
        </StyledShowPageBannerContainer>
      )}

      <StyledShowPageRightContainer>
        <StyledContentContainer isInRightDrawer={isInRightDrawer}>
          <LayoutRenderingProvider
            value={{
              targetRecordIdentifier: {
                id: targetRecordIdentifier.id,
                targetObjectNameSingular:
                  targetRecordIdentifier.targetObjectNameSingular,
              },
              layoutType:
                targetRecordIdentifier.targetObjectNameSingular ===
                CoreObjectNameSingular.Dashboard
                  ? PageLayoutType.DASHBOARD
                  : PageLayoutType.RECORD_PAGE,
              isInRightDrawer,
            }}
          >
            {isDefined(pageLayoutId) && (
              <PageLayoutRenderer pageLayoutId={pageLayoutId} />
            )}
          </LayoutRenderingProvider>
        </StyledContentContainer>

        {isInRightDrawer && (
          <RightDrawerFooter
            actions={[
              <RecordShowRightDrawerActionMenu />,
              <RecordShowRightDrawerOpenRecordButton
                objectNameSingular={
                  targetRecordIdentifier.targetObjectNameSingular
                }
                recordId={targetRecordIdentifier.id}
              />,
            ]}
          />
        )}
      </StyledShowPageRightContainer>
    </>
  );
};
