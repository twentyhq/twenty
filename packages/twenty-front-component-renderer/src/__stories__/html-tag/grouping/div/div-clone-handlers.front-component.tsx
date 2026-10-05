import { cloneElement, type ReactElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

type CloneClickHandlerProps = {
  render: ReactElement<{ onClick?: () => void }>;
  isCloneActive: boolean;
  onCloneClick: () => void;
};

const CloneClickHandler = ({
  render,
  isCloneActive,
  onCloneClick,
}: CloneClickHandlerProps) =>
  isCloneActive
    ? cloneElement(render, { onClick: () => onCloneClick() })
    : render;

const DivCloneHandlersFrontComponent = () => {
  const [clickSources, setClickSources] = useState<string[]>([]);
  const [saveCount, setSaveCount] = useState(0);
  const [isCloneActive, setIsCloneActive] = useState(true);
  const recordClick = (source: string) =>
    setClickSources((previousSources) => [...previousSources, source]);

  return (
    <FrontComponentCard title="div:clone-handlers">
      <div onClickCapture={() => recordClick('capture')}>
        <CloneClickHandler
          isCloneActive={isCloneActive}
          onCloneClick={() => recordClick('clone')}
          render={
            <button
              data-testid="subject"
              type="button"
              onClick={() => recordClick('jsx')}
            >
              Element with JSX and cloned click handlers
            </button>
          }
        />
      </div>
      <button
        data-testid="save-once"
        type="button"
        onClick={
          saveCount > 0
            ? undefined
            : () => setSaveCount((previousCount) => previousCount + 1)
        }
      >
        Save once
      </button>
      <button
        data-testid="stop-cloning"
        type="button"
        onClick={() => setIsCloneActive(false)}
      >
        Stop cloning
      </button>
      <span data-testid="front-component-value">{clickSources.join(',')}</span>
      <output data-testid="save-count">{saveCount}</output>
      <output data-testid="clone-state">
        {isCloneActive ? 'cloned' : 'not cloned'}
      </output>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-div-clone-handlers-00000000-0000-0000-0000-000000000020',
  name: 'div-clone-handlers-front-component',
  description:
    'Front component covering handlers written in JSX, added with cloneElement, registered for the capture phase, removed on re-render or dropped when the clone goes away',
  component: DivCloneHandlersFrontComponent,
});
