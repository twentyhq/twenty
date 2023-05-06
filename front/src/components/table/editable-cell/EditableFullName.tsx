import styled from '@emotion/styled';
import { ChangeEvent, useRef, useState } from 'react';
import EditableCellWrapper from './EditableCellWrapper';
import PersonChip from '../../chips/PersonChip';

type OwnProps = {
  firstname: string;
  lastname: string;
  changeHandler: (firstname: string, lastname: string) => void;
};

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  & > input:last-child {
    padding-left: ${(props) => props.theme.spacing(2)};
    border-left: 1px solid ${(props) => props.theme.primaryBorder};
  }
`;

const StyledEditInplaceInput = styled.input`
  width: 45%;
  border: none;
  outline: none;
  height: 18px;

  &::placeholder {
    font-weight: bold;
    color: ${(props) => props.theme.text20};
  }
`;

function EditableFullName({ firstname, lastname, changeHandler }: OwnProps) {
  const firstnameInputRef = useRef<HTMLInputElement>(null);
  const [firstnameValue, setFirstnameValue] = useState(firstname);
  const [lastnameValue, setLastnameValue] = useState(lastname);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <EditableCellWrapper
      onOutsideClick={() => setIsEditMode(false)}
      onInsideClick={() => setIsEditMode(true)}
      isEditMode={isEditMode}
      editModeContent={
        <StyledContainer>
          <StyledEditInplaceInput
            autoFocus
            placeholder="Firstname"
            ref={firstnameInputRef}
            value={firstnameValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setFirstnameValue(event.target.value);
              changeHandler(event.target.value, lastnameValue);
            }}
          />
          <StyledEditInplaceInput
            autoFocus
            placeholder={'Lastname'}
            ref={firstnameInputRef}
            value={lastnameValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setLastnameValue(event.target.value);
              changeHandler(firstnameValue, event.target.value);
            }}
          />
        </StyledContainer>
      }
      nonEditModeContent={
        <PersonChip name={firstnameValue + ' ' + lastnameValue} />
      }
    ></EditableCellWrapper>
  );
}

export default EditableFullName;
