import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconCheck, IconX } from 'twenty-ui';

import { isDefined } from '~/utils/isDefined';

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
      {isDefined(value) ? (
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
      ) : (
        <></>
      )}
    </>
  );
};
