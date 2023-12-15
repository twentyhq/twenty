import { useTheme } from '@emotion/react';

import IconGoogleRaw from '../assets/google.svg?react';

interface IconGoogleProps {
  size?: number;
}

export const IconGoogle = (props: IconGoogleProps) => {
  const theme = useTheme();
  const size = props.size ?? theme.icon.size.lg;

  return <IconGoogleRaw height={size} width={size} />;
};
