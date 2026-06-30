import { Img } from '@react-email/components';

const PRODUCT_LOGO_PATH = '/images/custom/logo.png';

const logoStyle = {
  marginBottom: '40px',
};

type LogoProps = {
  appUrl?: string;
};

export const Logo = ({ appUrl }: LogoProps) => {
  const logoUrl = appUrl
    ? new URL(PRODUCT_LOGO_PATH, appUrl).toString()
    : PRODUCT_LOGO_PATH;

  return (
    <Img
      src={logoUrl}
      alt="Application logo"
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
