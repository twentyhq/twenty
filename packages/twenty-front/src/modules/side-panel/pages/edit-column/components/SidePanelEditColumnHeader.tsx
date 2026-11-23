import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { type ReactNode } from 'react';

type SidePanelEditColumnHeaderProps = {
  icon: ReactNode;
  defaultLabel: string;
};

export const SidePanelEditColumnHeader = ({
  icon,
  defaultLabel,
}: SidePanelEditColumnHeaderProps) => (
  <PageCardHeader
    title={<HeaderIdentifier icon={icon} title={defaultLabel} />}
  />
);
