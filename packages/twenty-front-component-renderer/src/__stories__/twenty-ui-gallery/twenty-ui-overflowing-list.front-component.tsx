import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { OverflowingList } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { ThemeProvider } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

import { TwentyUiGalleryCard } from '../shared/front-components/twenty-ui-gallery-card';

const INITIAL_TARGETS = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
const REVIEWERS = ['Morgan', 'Taylor'];

const OverflowingListExample = () => {
  const [targets, setTargets] = useState(INITIAL_TARGETS);
  const [selectedTarget, setSelectedTarget] = useState('None');
  const [hostActivations, setHostActivations] = useState(0);
  const [listWidth, setListWidth] = useState(130);
  const [isMeasuredListMounted, setIsMeasuredListMounted] = useState(true);

  return (
    <TwentyUiGalleryCard title="Overflowing list">
      <ThemeProvider colorScheme="light" applyToRoot={false}>
        <div
          onClick={() => setHostActivations((count) => count + 1)}
          style={{ width: 300 }}
        >
          <OverflowingList
            showOverflowCount
            maxInlineCount={2}
            overflowLabel="Show all targets"
          >
            {targets.map((target) => (
              <Button key={target} onClick={() => setSelectedTarget(target)}>
                {target}
              </Button>
            ))}
          </OverflowingList>
        </div>
        <OverflowingList
          showOverflowCount
          maxInlineCount={1}
          overflowLabel="Show all reviewers"
          style={{ width: 300 }}
        >
          {REVIEWERS.map((reviewer) => (
            <Button key={reviewer}>{reviewer}</Button>
          ))}
        </OverflowingList>
      </ThemeProvider>
      <Button onClick={() => setTargets([...INITIAL_TARGETS, 'Echo'])}>
        Add target
      </Button>
      <Button>Outside list</Button>
      {isMeasuredListMounted && (
        <OverflowingList
          showOverflowCount
          overflowLabel="Show all measured items"
          style={{ width: listWidth }}
        >
          {INITIAL_TARGETS.map((target) => (
            <Button key={target} style={{ width: 90 }}>
              Measured {target}
            </Button>
          ))}
        </OverflowingList>
      )}
      <Button onClick={() => setListWidth(500)}>Widen measured list</Button>
      <Button onClick={() => setIsMeasuredListMounted(false)}>
        Remove measured list
      </Button>
      <output aria-label="Selected target">{selectedTarget}</output>
      <output aria-label="Host activations">{hostActivations}</output>
    </TwentyUiGalleryCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'c48a753e-24ce-4e43-8122-2c5d4568ae01',
  name: 'twenty-ui-overflowing-list',
  description: 'Overflow measurement and complete popup lists in the sandbox',
  component: OverflowingListExample,
});
