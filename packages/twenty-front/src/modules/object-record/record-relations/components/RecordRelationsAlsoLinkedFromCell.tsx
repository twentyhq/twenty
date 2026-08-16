// SOURCING: twentyhq/twenty RecordChip — mounted in fork-local Also linked from column
import { RecordChip } from '@/object-record/components/RecordChip';
import { type AlsoLinkedFromHit } from '@/object-record/record-relations/utils/computeAlsoLinkedFrom';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 32px;
  min-width: 160px;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

type RecordRelationsAlsoLinkedFromCellProps = {
  hits: AlsoLinkedFromHit[];
  objectNameSingular: string;
  recordsById: Map<string, ObjectRecord>;
};

export const RecordRelationsAlsoLinkedFromCell = ({
  hits,
  objectNameSingular,
  recordsById,
}: RecordRelationsAlsoLinkedFromCellProps) => {
  return (
    <StyledCell onClick={(event) => event.stopPropagation()}>
      {hits.map((hit) => {
        const record = recordsById.get(hit.recordId);

        if (!record) {
          return null;
        }

        return (
          <RecordChip
            key={hit.recordId}
            objectNameSingular={objectNameSingular}
            record={record}
          />
        );
      })}
      {hits.length > 0 && <StyledCount>{hits.length}</StyledCount>}
    </StyledCell>
  );
};
