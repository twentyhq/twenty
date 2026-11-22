import { NavigationMenuContainerContent } from '@/navigation-menu-item/display/containers/components/NavigationMenuContainerContent';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuTabContentProps = {
  tab: Pick<NavigationMenuItem, 'id'>;
};

export const NavigationMenuTabContent = ({
  tab,
}: NavigationMenuTabContentProps) => (
  <NavigationMenuContainerContent containerId={tab.id} />
);
