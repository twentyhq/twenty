import { useTheme } from '@emotion/react';

import { ReactComponent as IconGoogleRaw } from '../assets/google-icon.svg';

interface IconGoogleProps {
  size?: number;
}

export const IconGoogle = (props: IconGoogleProps): JSX.Element => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGoogleRaw height={size} width={size} />;
};
