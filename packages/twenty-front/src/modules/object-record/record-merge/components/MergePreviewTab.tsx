import { useMergePreview } from '@/object-record/record-merge/hooks/useMergePreview';
import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';

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

      <CardComponents.FieldCard
        targetableObject={{
          targetObjectNameSingular: objectNameSingular,
          id: recordId,
        }}
        showDuplicatesSection={false}
        isInRightDrawer={true}
      />
    </Section>
  );
};
