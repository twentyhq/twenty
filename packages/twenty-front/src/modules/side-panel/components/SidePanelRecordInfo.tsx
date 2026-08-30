import { RecordIdentifierBarCreatedAt } from '@/object-record/record-show/components/RecordIdentifierBarCreatedAt';
import { RecordIdentifierBarTitle } from '@/object-record/record-show/components/RecordIdentifierBarTitle';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { useSidePanelRoutedPagePathByPageId } from '@/side-panel/routing/hooks/useSidePanelRoutedPagePathByPageId';
import { getRecordShowParamsFromPath } from '@/side-panel/routing/utils/getRecordShowParamsFromPath';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
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
  const routedPagePath = useSidePanelRoutedPagePathByPageId(
    sidePanelPageInstanceId,
  );

  const recordShowParams = isDefined(routedPagePath)
    ? getRecordShowParamsFromPath(routedPagePath)
    : null;

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    recordShowParams?.objectNameSingular ?? '',
    recordShowParams?.objectRecordId ?? '',
  );

  if (!isDefined(recordShowParams)) {
    return null;
  }

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
