import { useNavigate } from 'react-router-dom';

import {
  IconBuildingSkyscraper,
  IconTargetArrow,
  IconUser,
} from '@/ui/display/icon/index';
import NavItem from '@/ui/navigation/navbar/desktop-navbar/components/NavItem';
import NavTitle from '@/ui/navigation/navbar/desktop-navbar/components/NavTitle';
import { measureTotalFrameLoad } from '~/utils/measureTotalFrameLoad';

const WorkspaceItems = ({ currentPath }: { currentPath: string }) => {
  const navigate = useNavigate();

  return (
    <>
      <NavTitle label="Workspace" />
      <NavItem
        label="Companies"
        to="/companies"
        Icon={IconBuildingSkyscraper}
        active={currentPath === '/companies'}
      />
      <NavItem
        label="People"
        to="/people"
        onClick={() => {
          measureTotalFrameLoad('people');
          navigate('/people');
        }}
        Icon={IconUser}
        active={currentPath === '/people'}
      />
      <NavItem
        label="Opportunities"
        onClick={() => {
          measureTotalFrameLoad('opportunities');
          navigate('/opportunities');
        }}
        Icon={IconTargetArrow}
        active={currentPath === '/opportunities'}
      />
    </>
  );
};

export default WorkspaceItems;
