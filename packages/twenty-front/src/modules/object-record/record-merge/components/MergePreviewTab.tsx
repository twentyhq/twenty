import { usePerformMergePreview } from '@/object-record/record-merge/hooks/usePerformMergePreview';
import { PageLayoutSingleTabRenderer } from '@/page-layout/components/PageLayoutSingleTabRenderer';
import { usePageLayoutIdForRecord } from '@/page-layout/hooks/usePageLayoutIdForRecord';
import { LayoutRenderingProvider } from '@/ui/layout/contexts/LayoutRenderingContext';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

type MergePreviewTabProps = {
  objectNameSingular: string;
};

export const MergePreviewTab = ({
  objectNameSingular,
}: MergePreviewTabProps) => {
  const { mergePreviewRecord, isGeneratingPreview } = usePerformMergePreview({
    objectNameSingular,
  });

  const { pageLayoutId } = usePageLayoutIdForRecord({
    id: mergePreviewRecord?.id ?? '',
    targetObjectNameSingular: objectNameSingular,
  });

  if (
    !isDefined(mergePreviewRecord) ||
    isGeneratingPreview ||
    !isDefined(pageLayoutId)
  ) {
    return null;
  }

  const recordId = mergePreviewRecord.id;

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
      <PageLayoutSingleTabRenderer pageLayoutId={pageLayoutId} />
    </LayoutRenderingProvider>
  );
};
