import { styled } from '@linaria/react';
import { IconCheck, IconX, THEME_COMMON } from 'twenty-ui';

const spacing = THEME_COMMON.spacingMultiplicator * 1;
const iconSizeSm = THEME_COMMON.icon.size.sm;

const StyledBooleanFieldValue = styled.div`
  margin-left: ${spacing}px;
`;

type BooleanDisplayProps = {
  value: boolean | null | undefined;
};

export const BooleanDisplay = ({ value }: BooleanDisplayProps) => {
  if (value === null || value === undefined) {
    return <></>;
  }

  const isTrue = value === true;

  return (
    <>
      {isTrue ? <IconCheck size={iconSizeSm} /> : <IconX size={iconSizeSm} />}
      <StyledBooleanFieldValue>
        {isTrue ? 'True' : 'False'}
      </StyledBooleanFieldValue>
    </>
  );
};
