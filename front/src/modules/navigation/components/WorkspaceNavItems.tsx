import { useLocation } from 'react-router-dom';

import { ObjectMetadataNavItems } from '@/object-metadata/components/ObjectMetadataNavItems';
import { IconTargetArrow } from '@/ui/display/icon/index';
import NavItem from '@/ui/navigation/navigation-drawer/components/NavItem';
import NavTitle from '@/ui/navigation/navigation-drawer/components/NavTitle';

export const WorkspaceNavItems = () => {
  const { pathname } = useLocation();

  return (
    <>
      <NavTitle label="Workspace" />
      <ObjectMetadataNavItems />
      <NavItem
        label="Opportunities"
        to="/objects/opportunities"
        active={pathname === '/objects/opportunities'}
        Icon={IconTargetArrow}
      />
    </>
  );
};
