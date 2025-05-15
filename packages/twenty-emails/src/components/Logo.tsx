import { Img } from '@react-email/components';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  return (
    <Img
      src="images/icons/windows11/Woulz-logo.png"
      alt="Woulz logo"
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
