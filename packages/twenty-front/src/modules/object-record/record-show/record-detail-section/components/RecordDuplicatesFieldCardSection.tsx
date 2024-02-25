import styled from '@emotion/styled';

import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindDuplicateRecords } from '@/object-record/hooks/useFindDuplicateRecords';
import { RecordDetailSectionHeader } from '@/object-record/record-show/record-detail-section/components/RecordDetailSectionHeader';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Section } from '@/ui/layout/section/components/Section';

const StyledCardContent = styled(CardContent)`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

export const RecordDuplicatesFieldCardSection = ({
  objectRecordId,
  objectNameSingular,
}: {
  objectRecordId: string;
  objectNameSingular: string;
}) => {
  const { records: duplicateRecords } = useFindDuplicateRecords({
    objectRecordId,
    objectNameSingular,
  });

  if (duplicateRecords.length === 0) {
    return null;
  }

  return (
    <Section>
      <RecordDetailSectionHeader title="Duplicates" />
      <Card>
        {duplicateRecords.slice(0, 5).map((duplicateRecord, index) => (
          <StyledCardContent
            key={`${objectNameSingular}${duplicateRecord.id}`}
            divider={index < duplicateRecords.length - 1}
          >
            <RecordChip
              record={duplicateRecord}
              objectNameSingular={objectNameSingular}
            />
          </StyledCardContent>
        ))}
      </Card>
    </Section>
  );
};
