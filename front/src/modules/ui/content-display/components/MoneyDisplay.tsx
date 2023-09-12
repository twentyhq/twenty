import styled from '@emotion/styled';

const StyledTextInputDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type OwnProps = {
  value: number | null;
};

export function MoneyDisplay({ value }: OwnProps) {
  return (
    <StyledTextInputDisplay>
      {value ? `$${value.toLocaleString()}` : ''}
    </StyledTextInputDisplay>
  );
}
