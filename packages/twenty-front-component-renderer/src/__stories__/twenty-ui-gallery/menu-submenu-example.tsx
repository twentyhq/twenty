import { Menu } from 'twenty-ui/primitives/surfaces';

type MenuSubmenuExampleProps = {
  onAction: (action: string) => void;
};

export const MenuSubmenuExample = ({ onAction }: MenuSubmenuExampleProps) => (
  <Menu.SubmenuRoot>
    <Menu.SubmenuTrigger>Export</Menu.SubmenuTrigger>
    <Menu.Portal>
      <Menu.Positioner>
        <Menu.Popup>
          <Menu.Item onClick={() => onAction('exported')}>Export PDF</Menu.Item>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.SubmenuRoot>
);
