import { useRecoilValue } from 'recoil';

import { isMockModeState } from '@/auth/states/isMockModeState';
import { Companies } from '~/pages/companies/Companies';
import { CompaniesMockMode } from '~/pages/companies/CompaniesMockMode';

export function AuthLayout({ children }: React.PropsWithChildren) {
  const isMockMode = useRecoilValue(isMockModeState);
  return (
    <>
      {isMockMode ? <CompaniesMockMode /> : <Companies />}
      {children}
    </>
  );
}
