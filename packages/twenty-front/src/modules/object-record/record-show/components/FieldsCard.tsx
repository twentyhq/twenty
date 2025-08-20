import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { useIsInRightDrawerOrThrow } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';

const StyledPropertyBoxContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(2)};
`;

type FieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
  showDuplicatesSection?: boolean;
};

export const FieldsCard = ({
  objectNameSingular,
  objectRecordId,
  showDuplicatesSection = true,
}: FieldsCardProps) => {
  const { isInRightDrawer } = useIsInRightDrawerOrThrow();

  return (
    <StyledPropertyBoxContainer>
      <RecordFieldList
        instanceId={`fields-card-${objectRecordId}-${isInRightDrawer ? 'right-drawer' : ''}`}
        objectNameSingular={objectNameSingular}
        objectRecordId={objectRecordId}
        showDuplicatesSection={showDuplicatesSection}
      />
    </StyledPropertyBoxContainer>
  );
};
