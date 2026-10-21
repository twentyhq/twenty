import { ConditionalDisplaySettings } from '@/conditional-display/components/ConditionalDisplaySettings';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type NavigationMenuItemVisibilityEditorProps = {
  item: NavigationMenuItem;
};

export const NavigationMenuItemVisibilityEditor = ({
  item,
}: NavigationMenuItemVisibilityEditorProps) => {
  const { updateItem } = useNavigationMenuItemEditController('workspace');

  return (
    <Dropdown.Page id="root" type="panel">
      <ConditionalDisplaySettings
        surface="navigationMenuItem"
        surfaceId={item.id}
        conditionalDisplay={item.conditionalDisplay}
        onConditionalDisplayChange={(conditionalDisplay) =>
          void updateItem(item.id, { conditionalDisplay })
        }
      />
    </Dropdown.Page>
  );
};
