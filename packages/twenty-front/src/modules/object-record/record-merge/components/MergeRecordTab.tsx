import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { Section } from 'twenty-ui/layout';
import React, { Suspense } from 'react';

const LazyFieldCard = React.lazy(() =>
  import('@/object-record/record-show/components/CardComponents').then(
    (mod) => ({ default: mod.CardComponents.FieldCard }),
  ),
);

type MergeRecordTabProps = {
  isInRightDrawer?: boolean;
  objectNameSingular: string;
  recordId: string;
};

export const MergeRecordTab = ({
  objectNameSingular,
  recordId,
}: MergeRecordTabProps) => {
  return (
    <Section>
      <SummaryCard
        objectNameSingular={objectNameSingular}
        objectRecordId={recordId}
        isInRightDrawer={true}
      />

      <Suspense fallback={<div>Loading...</div>}>
        <LazyFieldCard
          targetableObject={{
            targetObjectNameSingular: objectNameSingular,
            id: recordId,
          }}
          isInRightDrawer={true}
          showDuplicatesSection={false}
        />
      </Suspense>
    </Section>
  );
};
