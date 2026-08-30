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
  objectRecordId: string;
};

export const SidePanelRecordInfo = (props: SidePanelRecordInfoProps) => {
  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    props.objectNameSingular,
    props.objectRecordId,
  );

  return (
    <StyledRecordInfo>
      <RecordIdentifierBarTitle
        objectNameSingular={objectNameSingular}
        objectRecordId={objectRecordId}
        variant="side-panel"
      />
      <RecordIdentifierBarCreatedAt objectRecordId={objectRecordId} />
    </StyledRecordInfo>
  );
};
