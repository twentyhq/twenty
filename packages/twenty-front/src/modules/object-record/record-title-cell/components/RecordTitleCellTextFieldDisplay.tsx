import { t } from '@lingui/core/macro';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { type RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { withTheme, type Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledDiv = styled.div`
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  height: 24px;
  padding: ${({ theme }) => theme.spacing(0, 1.25)};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledEmptyText = withTheme(styled.div<{ theme: Theme }>`
  color: ${({ theme }) => theme.font.color.tertiary};
`);

export const RecordTitleCellSingleTextDisplayMode = ({
  containerType,
}: {
  containerType: RecordTitleCellContainerType;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordValue = useRecoilValue(recordStoreFamilyState(recordId));

  const isEmpty =
    recordValue?.[fieldDefinition.metadata.fieldName]?.trim() === '';

  const { openRecordTitleCell } = useRecordTitleCell();

  return (
    <StyledDiv
      onClick={() => {
        openRecordTitleCell({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          instanceId: getRecordFieldInputInstanceId({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
            prefix: containerType,
          }),
        });
      }}
    >
      {isEmpty ? (
        <StyledEmptyText>{t`Untitled`}</StyledEmptyText>
      ) : (
        <OverflowingTextWithTooltip
          text={
            recordValue?.[fieldDefinition.metadata.fieldName] ||
            fieldDefinition.label
          }
        />
      )}
    </StyledDiv>
  );
};
