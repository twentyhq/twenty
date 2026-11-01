import { createElement, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { CommandBlock } from 'twenty-ui/components/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';

export const CommandBlockExample = () => {
  const [copies, setCopies] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [renderClicks, setRenderClicks] = useState(0);

  return (
    <>
      <CommandBlock
        commands={['echo "<hello>"', 'npm run start']}
        title="Application commands"
        className="custom-commands"
        style={{ marginTop: 7 }}
        onClick={() => setClicks((count) => count + 1)}
        render={(props) =>
          createElement('section', {
            ...props,
            'aria-label': 'Application commands',
          })
        }
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
        actions={
          <>
            <Text render={<a href="#instructions" />}>Read instructions</Text>
            <Button onClick={() => setCopies((count) => count + 1)}>
              Copy commands
            </Button>
          </>
        }
      />
      <CommandBlock
        commands={['npm install']}
        onClick={() => setRenderClicks((count) => count + 1)}
        render={<div onClick={() => setClicks((count) => count + 1)} />}
        actions={<Button>Composed action</Button>}
      />
      <Text aria-label="Command copies">{copies}</Text>
      <Text aria-label="Command clicks">{clicks}</Text>
      <Text aria-label="Command render clicks">{renderClicks}</Text>
    </>
  );
};
