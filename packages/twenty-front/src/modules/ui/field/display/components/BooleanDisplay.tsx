import { styled } from '@linaria/react';
import { IconCheck, IconX } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

const iconSizeSm = 14;

const StyledBooleanFieldValue = styled.div`
  margin-left: 4px;
`;

type BooleanDisplayProps = {
  value: boolean | null | undefined;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  height: 20px;
`;

export const BooleanDisplay = ({ value }: BooleanDisplayProps) => {
  const { t } = useLingui();
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
