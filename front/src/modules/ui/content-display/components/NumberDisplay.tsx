import styled from '@emotion/styled';

const StyledNumberDisplay = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

type OwnProps = {
  value: string;
};

export function NumberDisplay({ value }: OwnProps) {
  return (
    <StyledNumberDisplay>
      {value && Number(value).toLocaleString()}
    </StyledNumberDisplay>
  );
}
