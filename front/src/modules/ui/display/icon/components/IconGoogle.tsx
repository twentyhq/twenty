import { ReactComponent as IconGoogleRaw } from '../assets/google-icon.svg';

interface IconGoogleProps {
  size?: number;
  stroke?: number;
}

export const IconGoogle = (props: IconGoogleProps): JSX.Element => {
  const size = props.size ?? 24;
  const stroke = props.stroke ?? 2;

  return <IconGoogleRaw height={size} width={size} strokeWidth={stroke} />;
};
