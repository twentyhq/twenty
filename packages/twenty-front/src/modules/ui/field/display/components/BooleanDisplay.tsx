import { styled } from '@linaria/react';
import { IconCheck, IconX } from 'twenty-ui/display';
import { THEME_COMMON } from 'twenty-ui/theme';

const spacing = THEME_COMMON.spacingMultiplicator * 1;
const iconSizeSm = THEME_COMMON.icon.size.sm;

const StyledBooleanFieldValue = styled.div`
  margin-left: ${spacing}px;
`;
const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

type BooleanDisplayProps = {
  value: boolean | null | undefined;
};

export const BooleanDisplay = ({ value }: BooleanDisplayProps) => {
  if (value === null || value === undefined) {
    return <StyledContainer></StyledContainer>;
  }

  const isTrue = value === true;

  return (
    <StyledContainer>
      {isTrue ? <IconCheck size={iconSizeSm} /> : <IconX size={iconSizeSm} />}
      <StyledBooleanFieldValue>
        {isTrue ? 'True' : 'False'}
      </StyledBooleanFieldValue>
    </StyledContainer>
  );
};
