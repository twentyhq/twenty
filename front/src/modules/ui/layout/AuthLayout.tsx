import { Companies } from '~/pages/companies/Companies';

export const AuthLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {/** Mocked data */}
      <Companies />
      {children}
    </>
  );
};
