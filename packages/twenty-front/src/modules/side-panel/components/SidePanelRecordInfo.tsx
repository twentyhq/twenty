import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordInfo = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type SidePanelRecordInfoProps = {
  objectNameSingular: string;
  recordId: string;
};

export const SidePanelRecordInfo = ({
  objectNameSingular,
  recordId,
}: SidePanelRecordInfoProps) => {
  const { objectNameSingular: resolvedObjectNameSingular, objectRecordId } =
    useRecordShowPage(objectNameSingular, recordId);

  return (
    <StyledRecordInfo>
      <RecordIdentifierBarTitle
        objectNameSingular={resolvedObjectNameSingular}
        objectRecordId={objectRecordId}
        variant="side-panel"
      />
      <RecordIdentifierBarCreatedAt objectRecordId={objectRecordId} />
    </StyledRecordInfo>
  );
};
