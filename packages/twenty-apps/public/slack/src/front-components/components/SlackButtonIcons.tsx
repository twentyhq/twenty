import { type IconComponent, IconDeviceFloppy, IconPlus } from 'twenty-ui/icon';

// twenty-ui types its icon slots against React 19; this app pins React 18 types,
// where tabler's forwarded ref component is not assignable to IconComponent.
export const SlackIconPlus: IconComponent = (props) => <IconPlus {...props} />;

export const SlackIconSave: IconComponent = (props) => (
  <IconDeviceFloppy {...props} />
);
