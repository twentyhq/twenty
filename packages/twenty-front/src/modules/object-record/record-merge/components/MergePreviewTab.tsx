import styled from '@emotion/styled';

import { useMergeRecordRelationships } from '@/object-record/record-merge/hooks/useMergeRecordRelationships';
import { CardComponents } from '@/object-record/record-show/components/CardComponents';
import { SummaryCard } from '@/object-record/record-show/components/SummaryCard';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Section } from 'twenty-ui/layout';

const StyledLoadingContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(8)};
`;

type MergePreviewTabProps = {
  objectNameSingular: string;
  mergedPreviewRecord?: ObjectRecord | null;
  onPreviewChange?: boolean;
  selectedRecords: ObjectRecord[];
};

export const MergePreviewTab = ({
  objectNameSingular,
  mergedPreviewRecord,
  onPreviewChange = false,
  selectedRecords,
}: MergePreviewTabProps) => {
  const { isLoading: isLoadingRelationships } = useMergeRecordRelationships({
    objectNameSingular,
    previewRecordId: mergedPreviewRecord?.id || '',
    selectedRecords: selectedRecords,
  });

  if (onPreviewChange || isLoadingRelationships) {
    return (
      <StyledLoadingContainer>
        Generating merge preview...
      </StyledLoadingContainer>
    );
  }

  if (!mergedPreviewRecord) {
    return null;
  }

  return (
    <Section>
      <SummaryCard
        objectNameSingular={objectNameSingular}
        objectRecordId={mergedPreviewRecord.id}
        isInRightDrawer={true}
      />

      <CardComponents.FieldCard
        targetableObject={{
          targetObjectNameSingular: objectNameSingular,
          id: mergedPreviewRecord.id,
        }}
        isInRightDrawer={true}
      />
    </Section>
  );
};
