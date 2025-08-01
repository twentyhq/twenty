import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { Section } from 'twenty-ui/layout';

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

      <CardComponents.FieldCard
        targetableObject={{
          targetObjectNameSingular: objectNameSingular,
          id: recordId,
        }}
        isInRightDrawer={true}
        showDuplicatesSection={false}
      />
    </Section>
  );
};
