import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';

const readElementId = (eventTarget: EventTarget | null): string =>
  eventTarget instanceof Element ? eventTarget.id : 'none';

const DivPropagationFrontComponent = () => {
  const [lastContainerClick, setLastContainerClick] = useState('none');
  const [containerClickCount, setContainerClickCount] = useState(0);
  const [isolatedClickCount, setIsolatedClickCount] = useState(0);
  const [blurRelatedTarget, setBlurRelatedTarget] = useState('none');
  const [lastDocumentClick, setLastDocumentClick] = useState('none');

  useEffect(() => {
    const recordDocumentClick = (event: Event) =>
      setLastDocumentClick(readElementId(event.target));

    document.addEventListener('click', recordDocumentClick);

    return () => document.removeEventListener('click', recordDocumentClick);
  }, []);

  return (
    <FrontComponentCard title="div:propagation">
      <div
        id="propagation-container"
        data-testid="container"
        onClick={(event) => {
          setContainerClickCount((count) => count + 1);
          setLastContainerClick(
            `${readElementId(event.target)} in ${readElementId(event.currentTarget)}`,
          );
        }}
      >
        <span id="propagation-label" data-testid="label">
          Label without a handler
        </span>
        <button
          id="propagation-isolated-button"
          data-testid="isolated-button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setIsolatedClickCount((count) => count + 1);
          }}
        >
          Isolated
        </button>
      </div>
      <input
        id="propagation-first-field"
        data-testid="first-field"
        aria-label="First field"
        onBlur={(event) =>
          setBlurRelatedTarget(readElementId(event.relatedTarget))
        }
      />
      <input
        id="propagation-second-field"
        data-testid="second-field"
        aria-label="Second field"
      />
      <output data-testid="container-click">{lastContainerClick}</output>
      <output data-testid="container-click-count">{containerClickCount}</output>
      <output data-testid="isolated-click-count">{isolatedClickCount}</output>
      <output data-testid="blur-related-target">{blurRelatedTarget}</output>
      <output data-testid="document-click">{lastDocumentClick}</output>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    'fc-div-propagation-00000000-0000-0000-0000-000000000020',
  name: 'div-propagation-front-component',
  description:
    'Front component covering event target, propagation and related target across <div> descendants',
  component: DivPropagationFrontComponent,
});
