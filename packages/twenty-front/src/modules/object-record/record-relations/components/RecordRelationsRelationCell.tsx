// SOURCING: twentyhq/twenty RecordChip — mounted in fork-local RELATIONS cells
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { extractConnectedRecords } from '@/object-record/record-relations/utils/extractConnectedRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  min-height: 32px;
  min-width: 140px;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
`;

type RecordRelationsRelationCellProps = {
  field: FieldMetadataItem;
  record: ObjectRecord;
};

export const RecordRelationsRelationCell = ({
  field,
  record,
}: RecordRelationsRelationCellProps) => {
  const connected = extractConnectedRecords(record[field.name]);
  const objectNameSingular =
    field.relation?.targetObjectMetadata.nameSingular;

  if (!isDefined(objectNameSingular)) {
    return <StyledCell />;
  }

  return (
    <StyledCell onClick={(event) => event.stopPropagation()}>
      {connected.map((connectedRecord) => (
        <RecordChip
          key={connectedRecord.id}
          objectNameSingular={objectNameSingular}
          record={connectedRecord}
        />
      ))}
      {connected.length > 0 && <StyledCount>{connected.length}</StyledCount>}
    </StyledCell>
  );
};
