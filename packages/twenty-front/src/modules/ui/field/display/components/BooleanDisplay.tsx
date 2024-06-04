import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCheck, IconX } from 'twenty-ui';

const StyledBooleanFieldValue = styled.div`
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

type BooleanDisplayProps = {
  value: boolean | null;
};

export const BooleanDisplay = ({ value }: BooleanDisplayProps) => {
  const theme = useTheme();

  return (
    <>
      {value ? (
        <IconCheck size={theme.icon.size.sm} />
      ) : (
        <IconX size={theme.icon.size.sm} />
      )}
      <StyledBooleanFieldValue>
        {value ? 'True' : 'False'}
      </StyledBooleanFieldValue>
    </>
  );
};
