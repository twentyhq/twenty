import { ReactComponent as IconGoogleRaw } from '../assets/google-icon.svg';

interface IconGoogleProps {
  size?: number;
}

export const IconGoogle = (props: IconGoogleProps): JSX.Element => {
  const size = props.size ?? 24;

  return <IconGoogleRaw height={size} width={size} />;
};
