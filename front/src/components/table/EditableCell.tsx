import styled from '@emotion/styled';
import { ChangeEvent, useRef, useState } from 'react';

type OwnProps = {
  content: string;
  changeHandler: (updated: string) => void;
};

const StyledEditable = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 32px;
  display: flex;
  align-items: center;
  width: 100%;

  :hover::before {
    display: block;
  }

  ::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 1px solid ${(props) => props.theme.text20};
    box-sizing: border-box;
    border-radius: 4px;
    pointer-events: none;
    display: none;
  }

  &:has(input:focus-within)::before {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    border: 1px solid ${(props) => props.theme.text20};
    border-radius: 4px;
    pointer-events: none;
    display: block;
    z-index: 1;
    box-shadow: 0px 3px 12px rgba(0, 0, 0, 0.09);
  }
`;

const StyledInplaceInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
`;

const Container = styled.div`
  width: 100%;
  padding-left: ${(props) => props.theme.spacing(2)};
  padding-right: ${(props) => props.theme.spacing(2)};
`;

function EditableCell({ content, changeHandler }: OwnProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(content);

  return (
    <StyledEditable
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      <Container>
        <StyledInplaceInput
          ref={inputRef}
          value={inputValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setInputValue(event.target.value);
            changeHandler(event.target.value);
          }}
        />
      </Container>
    </StyledEditable>
  );
}

export default EditableCell;
