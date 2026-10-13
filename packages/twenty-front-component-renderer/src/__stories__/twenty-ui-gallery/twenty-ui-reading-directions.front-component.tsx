import { AvatarGroup, JsonTree } from 'twenty-ui/components/data-display';
import { Callout } from 'twenty-ui/components/feedback';
import { Avatar, Badge } from 'twenty-ui/primitives/data-display';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Text } from 'twenty-ui/primitives/typography';

import { DirectionProvider } from 'twenty-ui/primitives/layout';
import { defineFrontComponent } from 'twenty-sdk/define';
import 'twenty-ui/style.css';
import { DirectionalResizeExample } from './directional-resize-example';

const DirectionalLayoutExample = ({
  direction,
}: {
  direction: 'ltr' | 'rtl';
}) => {
  return (
    <DirectionProvider direction={direction}>
      <div
        dir={direction}
        data-testid={`layout-${direction}`}
        style={{
          display: 'grid',
          gap: 20,
          width: 520,
          padding: 20,
          background: 'var(--t-background-primary)',
          color: 'var(--t-font-color-primary)',
        }}
      >
        <Text>{direction.toUpperCase()}</Text>
        <DirectionalResizeExample name={`Inherited ${direction} resize`} />
        <DirectionProvider direction={direction === 'ltr' ? 'rtl' : 'ltr'}>
          <div dir={direction === 'ltr' ? 'rtl' : 'ltr'}>
            <DirectionalResizeExample name={`Nested ${direction} resize`} />
          </div>
        </DirectionProvider>
        <Callout
          status="info"
          title="Account details"
          description="Review the information before continuing."
        />
        <ButtonGroup aria-label="Record actions">
          <Button>First action</Button>
          <Button>Last action</Button>
        </ButtonGroup>
        <Button disabled style={{ width: 240 }}>
          <Text
            render={<span />}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--t-spacing-1)',
            }}
          >
            Upcoming action
            <Badge>Soon</Badge>
          </Text>
        </Button>
        {(['left', 'right'] as const).map((overlap) => (
          <div
            key={overlap}
            data-testid={`avatars-${overlap}`}
            style={{ width: 'fit-content' }}
          >
            <AvatarGroup
              overlap={overlap}
              avatars={['Ada', 'Bea', 'Cam'].map((name) => (
                <Avatar key={name} name={name} size="lg" />
              ))}
              total={5}
            />
          </div>
        ))}
        <ListItem
          hasSubmenu
          description="Details"
          descriptionPlacement="end"
          style={{ width: 240 }}
        >
          A very long account name that must truncate
        </ListItem>
        <JsonTree
          value={{ account: { name: 'Ada' } }}
          emptyStringLabel="Empty text"
          emptyArrayLabel="Empty array"
          emptyObjectLabel="Empty object"
          arrowButtonCollapsedLabel="Expand node"
          arrowButtonExpandedLabel="Collapse node"
          shouldExpandNodeInitially={() => true}
        />
      </div>
    </DirectionProvider>
  );
};

const ReadingDirections = () => (
  <div
    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)' }}
  >
    {(['ltr', 'rtl'] as const).map((direction) => (
      <DirectionalLayoutExample key={direction} direction={direction} />
    ))}
  </div>
);

export default defineFrontComponent({
  universalIdentifier: '65a35b56-bc38-4d19-aac9-979838a573cd',
  name: 'twenty-ui-reading-directions',
  description: 'Reading direction layout and interactions',
  component: ReadingDirections,
});
