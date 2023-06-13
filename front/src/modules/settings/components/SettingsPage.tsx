import { SecondaryLayout } from '@/ui/layout/SecondaryLayout';

import { SettingsNavbar } from './SettingsNavbar';

type OwnProps = {
  children: JSX.Element;
};

export function SettingsPage({ children }: OwnProps) {
  return (
    <SecondaryLayout navbar={SettingsNavbar()}>{children}</SecondaryLayout>
  );
}
