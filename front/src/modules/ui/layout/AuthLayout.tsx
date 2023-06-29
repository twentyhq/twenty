import { Companies } from '~/pages/companies/Companies';

export function AuthLayout({ children }: React.PropsWithChildren) {
  return (
    <>
      {/** Mocked data */}
      <Companies />
      {children}
    </>
  );
}
