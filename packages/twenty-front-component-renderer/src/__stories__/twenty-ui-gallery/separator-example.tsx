import { createElement, useState } from 'react';
import { Button } from 'twenty-ui/primitives/input';
import { Separator } from 'twenty-ui/primitives/layout';
import { Text } from 'twenty-ui/primitives/typography';

export const SeparatorExample = () => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  );

  return (
    <>
      <Separator aria-label="Horizontal sections" />
      <Text style={{ display: 'flex', alignItems: 'stretch', height: 48 }}>
        <Text>First column</Text>
        <Separator aria-label="Vertical columns" orientation="vertical" />
        <Text>Second column</Text>
      </Text>
      <Separator
        aria-label="Composed divider"
        orientation={orientation}
        style={{ height: 24 }}
        ref={(element) => {
          element?.setAttribute('data-ref-target', 'separator');
        }}
        render={(props, state) =>
          createElement('span', {
            ...props,
            'data-render-orientation': state.orientation,
          })
        }
      />
      <Button
        onClick={() =>
          setOrientation((current) =>
            current === 'horizontal' ? 'vertical' : 'horizontal',
          )
        }
      >
        Change divider orientation
      </Button>
    </>
  );
};
