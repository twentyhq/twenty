import { Img } from '@react-email/components';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  return (
    <Img
      src="https://insuros.ca/public/logo.png"
      alt="InsurOS logo"
      width="40"
      height="40"
      style={logoStyle}
    />
  );
};
