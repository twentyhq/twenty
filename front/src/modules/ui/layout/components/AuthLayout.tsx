import { CompaniesMockMode } from '~/pages/companies/CompaniesMockMode';

export function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      <CompaniesMockMode />
      {children}
    </>
  );
}
