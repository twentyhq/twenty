import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordInfo = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type SidePanelRecordInfoProps = {
  sidePanelPageInstanceId: string;
};

export const SidePanelRecordInfo = ({
  sidePanelPageInstanceId,
}: SidePanelRecordInfoProps) => {
  const viewableRecordNameSingular = useAtomComponentStateValue(
    viewableRecordNameSingularComponentState,
    sidePanelPageInstanceId,
  );
  const viewableRecordId = useAtomComponentStateValue(
    viewableRecordIdComponentState,
    sidePanelPageInstanceId,
  );

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    viewableRecordNameSingular!,
    viewableRecordId!,
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
