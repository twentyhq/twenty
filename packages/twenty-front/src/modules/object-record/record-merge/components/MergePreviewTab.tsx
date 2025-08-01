import { useMergePreview } from '@/object-record/record-merge/hooks/useMergePreview';
import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';

const StyledLoadingContainer = styled.div`
  align-items: center;
  display: flex;
  height: 100px;
  justify-content: center;
`;

type MergePreviewTabProps = {
  objectNameSingular: string;
};

export const MergePreviewTab = ({
  objectNameSingular,
}: MergePreviewTabProps) => {
  const { mergePreviewRecord, isGeneratingPreview } = useMergePreview({
    objectNameSingular,
  });

  if (isGeneratingPreview) {
    return (
      <StyledLoadingContainer>
        Generating merge preview...
      </StyledLoadingContainer>
    );
  }

  if (!isDefined(mergePreviewRecord)) {
    return null;
  }

  return (
    <Section>
      <SummaryCard
        objectNameSingular={objectNameSingular}
        objectRecordId={mergePreviewRecord.id}
        isInRightDrawer={true}
      />

      <CardComponents.FieldCard
        targetableObject={{
          targetObjectNameSingular: objectNameSingular,
          id: mergePreviewRecord.id,
        }}
        showDuplicatesSection={false}
        isInRightDrawer={true}
      />
    </Section>
  );
};
