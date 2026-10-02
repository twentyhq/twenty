import { cloneElement, type ReactElement, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

type CloneClickHandlerProps = {
  render: ReactElement<{ onClick?: () => void }>;
  onCloneClick: () => void;
};

const CloneClickHandler = ({ render, onCloneClick }: CloneClickHandlerProps) =>
  cloneElement(render, { onClick: () => onCloneClick() });

const DivCloneHandlersFrontComponent = () => {
  const [clickSources, setClickSources] = useState<string[]>([]);
  const [saveCount, setSaveCount] = useState(0);
  const recordClick = (source: string) =>
    setClickSources((previousSources) => [...previousSources, source]);

  return (
    <FrontComponentCard title="div:clone-handlers">
      <div onClickCapture={() => recordClick('capture')}>
        <CloneClickHandler
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
      <span data-testid="front-component-value">{clickSources.join(',')}</span>
      <output data-testid="save-count">{saveCount}</output>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-div-clone-handlers-00000000-0000-0000-0000-000000000020',
  name: 'div-clone-handlers-front-component',
  description:
    'Front component covering handlers written in JSX, added with cloneElement, registered for the capture phase or removed on re-render',
  component: DivCloneHandlersFrontComponent,
});
