import styled from '@emotion/styled';
import { type ChangeEvent, type MutableRefObject } from 'react';
import { type RecoilState, useRecoilState, useRecoilValue } from 'recoil';

const StyledContainer = styled.div`
  display: inline-flex;
  flex-direction: column;
  width: 100%;
`;

const StyledInput = styled.input`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  height: 32px;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const RecoilAtomReader = ({
  valueState,
  timingsRef,
}: {
  valueState: RecoilState<string>;
  timingsRef?: MutableRefObject<number[]>;
}) => {
  const start = performance.now();
  const value = useRecoilValue(valueState);
  if (timingsRef !== undefined) {
    timingsRef.current.push(performance.now() - start);
  }

  return <span data-length={value.length} />;
};

type RecoilTextInputProps = {
  valueState: RecoilState<string>;
  extraStates?: RecoilState<string>[];
  placeholder?: string;
};

export const RecoilTextInput = ({
  valueState,
  extraStates,
  placeholder,
}: RecoilTextInputProps) => {
  const [value, setValue] = useRecoilState(valueState);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  return (
    <StyledContainer>
      <StyledInput
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
      />
      {extraStates?.map((extraState, index) => (
        <RecoilAtomReader key={index} valueState={extraState} />
      ))}
    </StyledContainer>
  );
};
