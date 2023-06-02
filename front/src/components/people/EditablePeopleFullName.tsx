import { useState } from 'react';
import PersonChip from '../chips/PersonChip';
import { EditableDoubleText } from '../editable-cell/EditableDoubleText';
import { CellCommentChip } from '../comments/CellCommentChip';
import styled from '@emotion/styled';

type OwnProps = {
  firstname: string;
  lastname: string;
  onChange: (firstname: string, lastname: string) => void;
};

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export function EditablePeopleFullName({
  firstname,
  lastname,
  onChange,
}: OwnProps) {
  const [firstnameValue, setFirstnameValue] = useState(firstname);
  const [lastnameValue, setLastnameValue] = useState(lastname);

  function handleDoubleTextChange(
    firstValue: string,
    secondValue: string,
  ): void {
    setFirstnameValue(firstValue);
    setLastnameValue(secondValue);

    onChange(firstValue, secondValue);
  }

  function handleCommentClick(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    console.log('comment clicked');
  }

  return (
    <EditableDoubleText
      firstValue={firstnameValue}
      secondValue={lastnameValue}
      firstValuePlaceholder="First name"
      secondValuePlaceholder="Last name"
      onChange={handleDoubleTextChange}
      nonEditModeContent={
        <>
          <StyledDiv>
            <PersonChip name={firstname + ' ' + lastname} />
          </StyledDiv>
          <CellCommentChip count={12} onClick={handleCommentClick} />
        </>
      }
    />
  );
}
