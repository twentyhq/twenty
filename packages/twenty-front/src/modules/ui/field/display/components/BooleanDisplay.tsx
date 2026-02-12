import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconCheck, IconX } from 'twenty-ui/display';
import { THEME_COMMON } from 'twenty-ui/theme';

const spacing = THEME_COMMON.spacingMultiplicator * 1;
const iconSizeSm = THEME_COMMON.icon.size.sm;

const StyledBooleanFieldValue = styled.div`
  margin-left: ${spacing}px;
`;

type BooleanDisplayProps = {
  value: boolean | null | undefined;
};

const StyledContainer = styled.div`
  height: 20px;
  display: flex;
  align-items: center;
`;

export const BooleanDisplay = ({ value }: BooleanDisplayProps) => {
  if (value === null || value === undefined) {
    return <StyledContainer />;
  }

  const isTrue = value === true;

  return (
    <StyledContainer>
      {isTrue ? <IconCheck size={iconSizeSm} /> : <IconX size={iconSizeSm} />}
      <StyledBooleanFieldValue>
        {isTrue ? t`True` : t`False`}
      </StyledBooleanFieldValue>
    </StyledContainer>
  );
};
