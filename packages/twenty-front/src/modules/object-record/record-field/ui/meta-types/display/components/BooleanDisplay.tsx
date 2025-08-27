import { IconCheck, IconX } from 'twenty-ui/display';
import { BasicCellContainer } from 'twenty-ui/input';
import { THEME_COMMON } from 'twenty-ui/theme';

const spacingUnit = THEME_COMMON.spacingMultiplicator * 1;
const iconSizeSm = THEME_COMMON.icon.size.sm;

type BooleanDisplayProps = {
  value: boolean | null | undefined;
};

export const BooleanDisplay = ({ value }: BooleanDisplayProps) => {
  if (value === null || value === undefined) {
    return <BasicCellContainer />;
  }

  const isTrue = value === true;

  return (
    <BasicCellContainer>
      {isTrue ? <IconCheck size={iconSizeSm} /> : <IconX size={iconSizeSm} />}
      <div style={{ marginLeft: spacingUnit }}>{isTrue ? 'True' : 'False'}</div>
    </BasicCellContainer>
  );
};
