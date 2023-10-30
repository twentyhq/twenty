import { useURLV2Field } from '../../hooks/useURLV2Field';
import { URLV2Display } from '../content-display/components/URLDisplayV2';

export const URLV2FieldDisplay = () => {
  const { fieldValue } = useURLV2Field();

  return <URLV2Display value={fieldValue} />;
};
