import { RecordShowSidePanelOpenRecordButton } from '@/command-menu-item/components/RecordShowSidePanelOpenRecordButton';
import { RecordComponentInstanceContextsWrapper } from '@/object-record/components/RecordComponentInstanceContextsWrapper';
import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { PageLayoutSingleTabRenderer } from '@/page-layout/components/PageLayoutSingleTabRenderer';
import { usePageLayoutIdForRecord } from '@/page-layout/hooks/usePageLayoutIdForRecord';
import { SIDE_PANEL_SEARCH_RECORD_PREVIEW_INSTANCE_ID } from '@/side-panel/pages/search/constants/SidePanelSearchRecordPreviewInstanceId';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { styled } from '@linaria/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { PageLayoutType } from '~/generated-metadata/graphql';

const StyledPreviewContent = styled.div`
  background: ${themeCssVariables.background.primary};
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

type SidePanelSearchRecordPreviewProps = {
  objectNameSingular: string;
  recordId: string;
};

export const SidePanelSearchRecordPreview = ({
  objectNameSingular,
  recordId,
}: SidePanelSearchRecordPreviewProps) => {
  const { pageLayoutId } = usePageLayoutIdForRecord({
    id: recordId,
    targetObjectNameSingular: objectNameSingular,
  });

  return (
    <RecordComponentInstanceContextsWrapper
      componentInstanceId={SIDE_PANEL_SEARCH_RECORD_PREVIEW_INSTANCE_ID}
    >
      <LayoutRenderingProvider
        value={{
          targetRecordIdentifier: {
            id: recordId,
            targetObjectNameSingular: objectNameSingular,
          },
          layoutType:
            objectNameSingular === CoreObjectNameSingular.Dashboard
              ? PageLayoutType.DASHBOARD
              : PageLayoutType.RECORD_PAGE,
          isInSidePanel: true,
        }}
      >
        <RecordShowEffect
          objectNameSingular={objectNameSingular}
          recordId={recordId}
        />
        <StyledPreviewContent>
          {isDefined(pageLayoutId) && (
            <PageLayoutSingleTabRenderer pageLayoutId={pageLayoutId} />
          )}
        </StyledPreviewContent>
        <SidePanelFooter
          actions={[
            <RecordShowSidePanelOpenRecordButton
              key="open"
              objectNameSingular={objectNameSingular}
              recordId={recordId}
            />,
          ]}
        />
      </LayoutRenderingProvider>
    </RecordComponentInstanceContextsWrapper>
  );
};
