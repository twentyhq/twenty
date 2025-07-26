import styled from '@emotion/styled';

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
  isInRightDrawer?: boolean;
  objectNameSingular: string;
  mergedPreviewRecord?: ObjectRecord | null;
  isGeneratingPreview?: boolean;
};

export const MergePreviewTab = ({
  isInRightDrawer = true,
  objectNameSingular,
  mergedPreviewRecord,
  isGeneratingPreview = false,
}: MergePreviewTabProps) => {
  if (isGeneratingPreview) {
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
        isInRightDrawer={isInRightDrawer}
      />

      <CardComponents.FieldCard
        targetableObject={{
          targetObjectNameSingular: objectNameSingular,
          id: mergedPreviewRecord.id,
        }}
        isInRightDrawer={isInRightDrawer}
      />
    </Section>
  );
};
