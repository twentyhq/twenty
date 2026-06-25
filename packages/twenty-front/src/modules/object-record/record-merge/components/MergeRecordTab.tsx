import { RecordShowEffect } from '@/object-record/record-show/components/RecordShowEffect';
import { PageLayoutSingleTabRenderer } from '@/page-layout/components/PageLayoutSingleTabRenderer';
import { usePageLayoutIdForRecord } from '@/page-layout/hooks/usePageLayoutIdForRecord';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

type MergeRecordTabProps = {
  objectNameSingular: string;
  recordId: string;
};

export const MergeRecordTab = ({
  objectNameSingular,
  recordId,
}: MergeRecordTabProps) => {
  const { pageLayoutId } = usePageLayoutIdForRecord({
    id: recordId,
    targetObjectNameSingular: objectNameSingular,
  });

  return (
    <LayoutRenderingProvider
      value={{
        targetRecordIdentifier: {
          id: recordId,
          targetObjectNameSingular: objectNameSingular,
        },
        layoutType: PageLayoutType.RECORD_PAGE,
        isInSidePanel: true,
      }}
    >
      <RecordShowEffect
        objectNameSingular={objectNameSingular}
        recordId={recordId}
      />
      {isDefined(pageLayoutId) && (
        <PageLayoutSingleTabRenderer pageLayoutId={pageLayoutId} />
      )}
    </LayoutRenderingProvider>
  );
};
