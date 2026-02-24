import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { type RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledDiv = styled.div`
  align-items: center;
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  height: 24px;
  justify-content: center;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(0, 1.25)};
`;

export const RecordTitleCellUuidFieldDisplay = ({
  containerType: _containerType,
}: {
  containerType: RecordTitleCellContainerType;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordValue = useFamilyRecoilValueV2(recordStoreFamilyState, recordId);

  const uuidValue = recordValue?.[fieldDefinition.metadata.fieldName] ?? '';

  return (
    <StyledDiv>
      <OverflowingTextWithTooltip text={uuidValue} />
    </StyledDiv>
  );
};
