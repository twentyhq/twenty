import { useDoubleTextField } from '../../hooks/useDoubleTextField';
import { TextDisplay } from '../content-display/components/TextDisplay';

export const DoubleTextFieldDisplay = () => {
  const { firstValue, secondValue } = useDoubleTextField();

  const content = [firstValue, secondValue].filter(Boolean).join(' ');

  return <TextDisplay text={content} />;
};
