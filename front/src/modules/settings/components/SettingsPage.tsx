import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';
import { DefaultLayout } from '@/ui/layout/DefaultLayout';
import { SecondaryLayout } from '@/ui/layout/SecondaryLayout';

import { SettingsNavbar } from './SettingsNavbar';

type OwnProps = {
  children: JSX.Element;
};

export function SettingsPage({ children }: OwnProps) {
  return (
    <DefaultLayout Navbar={SettingsNavbar}>
      <NoTopBarContainer>{children}</NoTopBarContainer>
    </DefaultLayout>
  );
}
