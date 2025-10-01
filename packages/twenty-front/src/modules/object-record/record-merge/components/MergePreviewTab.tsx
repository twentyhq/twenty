import { useMergePreview } from '@/object-record/record-merge/hooks/useMergePreview';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import React, { Suspense } from 'react';
import { FieldCardSkeleton } from '@/object-record/record-show/components/FieldCardSkeleton';

const LazyFieldCard = React.lazy(() =>
  import('@/object-record/record-show/components/CardComponents').then(
    (mod) => ({ default: mod.CardComponents.FieldCard }),
  ),
);

type MergePreviewTabProps = {
  objectNameSingular: string;
};

export const MergePreviewTab = ({
  objectNameSingular,
}: MergePreviewTabProps) => {
  const { mergePreviewRecord, isGeneratingPreview } = useMergePreview({
    objectNameSingular,
  });

  if (!isDefined(mergePreviewRecord) && !isGeneratingPreview) {
    return null;
  }

  const recordId = mergePreviewRecord?.id ?? 'merge-preview-loading';

  return (
    <Section>
      <SummaryCard
        objectNameSingular={objectNameSingular}
        objectRecordId={recordId}
        isInRightDrawer={true}
      />
      <Suspense fallback={<FieldCardSkeleton isInRightDrawer={true} />}>
        <LazyFieldCard
          targetableObject={{
            targetObjectNameSingular: objectNameSingular,
            id: recordId,
          }}
          showDuplicatesSection={false}
          isInRightDrawer={true}
        />
      </Suspense>
    </Section>
  );
};
