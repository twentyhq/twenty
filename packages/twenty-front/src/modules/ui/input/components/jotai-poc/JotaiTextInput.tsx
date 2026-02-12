import styled from '@emotion/styled';
import { useAtom, useAtomValue, type WritableAtom } from 'jotai';
import { type ChangeEvent, type MutableRefObject } from 'react';

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

type JotaiReadOnlyAtom = WritableAtom<
  string,
  [string | ((prev: string) => string)],
  void
>;

const JotaiAtomReader = ({
  atom: readAtom,
  timingsRef,
}: {
  atom: JotaiReadOnlyAtom;
  timingsRef?: MutableRefObject<number[]>;
}) => {
  const start = performance.now();
  const value = useAtomValue(readAtom);
  if (timingsRef !== undefined) {
    timingsRef.current.push(performance.now() - start);
  }

  return <span data-length={value.length} />;
};

type JotaiTextInputProps = {
  atom: JotaiReadOnlyAtom;
  extraAtoms?: JotaiReadOnlyAtom[];
  placeholder?: string;
};

export const JotaiTextInput = ({
  atom: inputAtom,
  extraAtoms,
  placeholder,
}: JotaiTextInputProps) => {
  const [value, setValue] = useAtom(inputAtom);

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
      {extraAtoms?.map((extraAtom, index) => (
        <JotaiAtomReader key={index} atom={extraAtom} />
      ))}
    </StyledContainer>
  );
};
