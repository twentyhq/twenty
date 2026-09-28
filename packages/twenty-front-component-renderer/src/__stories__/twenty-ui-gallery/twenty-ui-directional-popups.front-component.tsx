import { defineFrontComponent } from 'twenty-sdk/define';
import { Dropdown } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { TextDirectionProvider } from 'twenty-ui/primitives/layout';
import { Menu, Tooltip } from 'twenty-ui/primitives/surfaces';
import 'twenty-ui/style.css';

const DirectionalPopups = () => (
  <TextDirectionProvider direction="rtl">
    <div dir="rtl" style={{ padding: 100, display: 'flex', gap: 24 }}>
      <Menu.Root>
        <Menu.Trigger render={<Button>Open menu</Button>} />
        <Menu.Popup>
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger>Menu export</Menu.SubmenuTrigger>
            <Menu.Popup>
              <Menu.Item>Menu CSV</Menu.Item>
            </Menu.Popup>
          </Menu.SubmenuRoot>
        </Menu.Popup>
      </Menu.Root>
      <Dropdown.Root type="menu">
        <Dropdown.Trigger render={<Button>Open dropdown</Button>} />
        <Dropdown.Content aria-label="Record dropdown">
          <Dropdown.Submenu>
            <Dropdown.SubmenuTrigger>Dropdown export</Dropdown.SubmenuTrigger>
            <Dropdown.Content aria-label="Export formats">
              <Dropdown.ActionItem>Dropdown CSV</Dropdown.ActionItem>
            </Dropdown.Content>
          </Dropdown.Submenu>
        </Dropdown.Content>
      </Dropdown.Root>
      <Tooltip.Root>
        <Tooltip.Trigger render={<Button>Tooltip target</Button>} />
        <Tooltip.Popup>Directional tooltip</Tooltip.Popup>
      </Tooltip.Root>
    </div>
  </TextDirectionProvider>
);

export default defineFrontComponent({
  universalIdentifier: '62219134-12fa-4b8b-8636-739e82f05d75',
  name: 'twenty-ui-directional-popups',
  description: 'Directional popup compatibility probe',
  component: DirectionalPopups,
});
