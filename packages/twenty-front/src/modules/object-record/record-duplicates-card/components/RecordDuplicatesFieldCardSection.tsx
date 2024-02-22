import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindDuplicateRecords } from '@/object-record/hooks/useFindDuplicateRecords';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { Section } from '@/ui/layout/section/components/Section';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

const StyledHeader = styled.header<{ isDropdownOpen?: boolean }>`
  align-items: center;
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  padding: ${() => (useIsMobile() ? '0 12px' : 'unset')};

  ${({ isDropdownOpen, theme }) =>
    isDropdownOpen
      ? ''
      : css`
          .displayOnHover {
            opacity: 0;
            pointer-events: none;
            transition: opacity ${theme.animation.duration.instant}s ease;
          }
        `}

  &:hover {
    .displayOnHover {
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const StyledTitle = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTitleLabel = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

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
      <StyledHeader>
        <StyledTitle>
          <StyledTitleLabel>Duplicates</StyledTitleLabel>
        </StyledTitle>
      </StyledHeader>
      <Card>
        <StyledCardContent>
          {duplicateRecords.slice(0, 5).map((duplicateRecord) => (
            <RecordChip
              key={`${objectNameSingular}${duplicateRecord.id}`}
              record={duplicateRecord}
              objectNameSingular={objectNameSingular}
            />
          ))}
        </StyledCardContent>
      </Card>
    </Section>
  );
};
