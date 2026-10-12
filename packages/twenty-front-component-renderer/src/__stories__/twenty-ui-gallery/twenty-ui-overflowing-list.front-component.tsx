import { useId, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { OverflowingList } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { ThemeProvider } from 'twenty-ui/theme';
import 'twenty-ui/style.css';

import { TwentyUiGalleryCard } from '../shared/front-components/twenty-ui-gallery-card';
import { OverflowingListStatefulTarget } from './components/OverflowingListStatefulTarget';

const INITIAL_TARGETS = ['Alpha', 'Bravo', 'Charlie', 'Delta'];
const REVIEWERS = ['Morgan', 'Taylor'];

const OverflowingListExample = () => {
  const targetListId = useId();
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
            triggerProps={{ onClick: (event) => event.stopPropagation() }}
            popupProps={{ onClick: (event) => event.stopPropagation() }}
            maxInlineCount={2}
            overflowLabel="Show hidden targets"
          >
            {targets.map((target) => (
              <OverflowingListStatefulTarget
                key={target}
                target={target}
                idPrefix={targetListId}
                onSelect={setSelectedTarget}
              />
            ))}
          </OverflowingList>
        </div>
        <OverflowingList
          showOverflowCount
          maxInlineCount={1}
          overflowLabel="Show hidden reviewers"
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
          overflowLabel="Show hidden measured items"
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
  description:
    'Overflow counts, single item instances and controlled popup composition',
  component: OverflowingListExample,
});
