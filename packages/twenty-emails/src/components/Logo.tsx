import { Img } from '@react-email/components';

const logoStyle = {
  marginBottom: '40px',
};

export const Logo = () => {
  return (
    <Img
      src="https://woulz.com.br/images/icons/windows11/Woulz-logoprincipal.png"
      alt="Woulz logo"
      height={50}
      className="mx-auto"
      style={logoStyle}
    />
  );
};
