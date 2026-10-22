import { type CSSProperties, type RefObject, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

import { createNumberedLabels } from '@/__stories__/twenty-ui-gallery/utils/createNumberedLabels';

const ROW_STYLE: CSSProperties = { blockSize: 24, lineHeight: '24px' };

const CHIP_STYLE: CSSProperties = {
  display: 'inline-block',
  inlineSize: 60,
  marginInlineEnd: 8,
};

const SCROLLER_STYLE: CSSProperties = {
  blockSize: 80,
  inlineSize: 200,
  overflowY: 'auto',
};

const CHIP_LABELS = createNumberedLabels({ prefix: 'Chip', count: 20 });

const ScrollRows = ({ prefix, count }: { prefix: string; count: number }) => (
  <>
    {createNumberedLabels({ prefix, count }).map((label) => (
      <div key={label} style={ROW_STYLE}>
        {label}
      </div>
    ))}
  </>
);

const findChildByText = ({
  container,
  text,
}: {
  container: HTMLElement | null;
  text: string;
}): Element | undefined =>
  Array.from(container?.children ?? []).find(
    (child) => child.textContent === text,
  );

const writeScrollOffsetAndRecordReads = ({
  element,
  property,
  offset,
  setReads,
}: {
  element: HTMLElement | null;
  property: 'scrollTop' | 'scrollLeft';
  offset: number;
  setReads: (reads: string) => void;
}) => {
  if (!isDefined(element)) {
    return;
  }

  element[property] = offset;
  const synchronousRead = element[property];

  requestAnimationFrame(() =>
    setReads(`sync:${synchronousRead};next:${element[property]}`),
  );
};

const ScrollCommandsComponent = () => {
  const innerScrollerRef = useRef<HTMLDivElement>(null);
  const rightToLeftChipsRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const echoTargetRef = useRef<HTMLDivElement>(null);
  const portalScrollerRef = useRef<HTMLDivElement>(null);
  const detachableContainerRef = useRef<HTMLDivElement>(null);
  const detachableScrollerRef = useRef<HTMLDivElement>(null);
  const [logReads, setLogReads] = useState('none');
  const [chipReads, setChipReads] = useState('none');
  const [portalRead, setPortalRead] = useState('none');
  const [echoRead, setEchoRead] = useState('none');
  const [pageScrollStatus, setPageScrollStatus] = useState('none');
  const [keyboardScrollKeys, setKeyboardScrollKeys] = useState(0);

  const revealButtons: {
    label: string;
    containerRef: RefObject<HTMLDivElement | null>;
    text: string;
    options: ScrollIntoViewOptions;
  }[] = [
    {
      label: 'Reveal row 25',
      containerRef: innerScrollerRef,
      text: 'Row 25',
      options: { block: 'nearest' },
    },
    {
      label: 'Center row 25',
      containerRef: innerScrollerRef,
      text: 'Row 25',
      options: { block: 'center' },
    },
    {
      label: 'Reveal chip 18',
      containerRef: rightToLeftChipsRef,
      text: 'Chip 18',
      options: { block: 'nearest', inline: 'nearest' },
    },
    {
      label: 'Start chip 18',
      containerRef: rightToLeftChipsRef,
      text: 'Chip 18',
      options: { block: 'nearest', inline: 'start' },
    },
  ];

  const tryPageScroll = () => {
    try {
      document.documentElement.scrollTop = 500;
      document.body.scrollTop = 500;
      window.scrollTo(0, 500);
      window.scroll(0, 500);
      window.scrollBy(0, 10);
      setPageScrollStatus('ok');
    } catch {
      setPageScrollStatus('failed');
    }
  };

  return (
    <div
      data-testid="front-component-mounted"
      style={{ display: 'grid', gap: 8 }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {revealButtons.map(({ label, containerRef, text, options }) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              findChildByText({
                container: containerRef.current,
                text,
              })?.scrollIntoView(options)
            }
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            writeScrollOffsetAndRecordReads({
              element: logRef.current,
              property: 'scrollTop',
              offset: 120,
              setReads: setLogReads,
            })
          }
        >
          Write log 120
        </button>
        <button
          type="button"
          onClick={() =>
            writeScrollOffsetAndRecordReads({
              element: rightToLeftChipsRef.current,
              property: 'scrollLeft',
              offset: -120,
              setReads: setChipReads,
            })
          }
        >
          Write chips -120
        </button>
        <button
          type="button"
          onClick={() => setEchoRead(String(echoTargetRef.current?.scrollTop))}
        >
          Read echo position
        </button>
        <button
          type="button"
          onClick={() => {
            const echoTarget = echoTargetRef.current;

            if (isDefined(echoTarget)) {
              echoTarget.scrollTop = echoTarget.scrollTop;
            }
          }}
        >
          Echo position
        </button>
        <button
          type="button"
          onClick={() => {
            const detachableScroller = detachableScrollerRef.current;

            if (!isDefined(detachableScroller)) {
              return;
            }

            detachableScroller.scrollTop = 120;
            detachableScroller.remove();
          }}
        >
          Write and detach
        </button>
        <button
          type="button"
          onClick={() => {
            const detachableScroller = detachableScrollerRef.current;

            if (!isDefined(detachableScroller)) {
              return;
            }

            detachableContainerRef.current?.append(detachableScroller);
          }}
        >
          Reattach
        </button>
        <button
          type="button"
          onClick={() =>
            setPortalRead(String(portalScrollerRef.current?.scrollTop))
          }
        >
          Read portal scroll
        </button>
        <button type="button" onClick={tryPageScroll}>
          Try page scroll
        </button>
      </div>
      <div role="status" aria-label="Log reads">
        {logReads}
      </div>
      <div role="status" aria-label="Chip reads">
        {chipReads}
      </div>
      <div role="status" aria-label="Portal read">
        {portalRead}
      </div>
      <div role="status" aria-label="Echo read">
        {echoRead}
      </div>
      <div role="status" aria-label="Page scroll">
        {pageScrollStatus}
      </div>
      <div role="status" aria-label="Keyboard scroll keys">
        {keyboardScrollKeys}
      </div>
      <div
        role="region"
        aria-label="Outer scroller"
        style={{ ...SCROLLER_STYLE, blockSize: 120 }}
      >
        <div style={{ blockSize: 200 }} />
        <div
          ref={innerScrollerRef}
          role="region"
          aria-label="Inner scroller"
          style={{ blockSize: 100, overflowY: 'auto' }}
        >
          <ScrollRows prefix="Row" count={30} />
        </div>
      </div>
      <div
        ref={rightToLeftChipsRef}
        dir="rtl"
        role="region"
        aria-label="RTL chips"
        style={{ inlineSize: 200, overflowX: 'auto', whiteSpace: 'nowrap' }}
      >
        {CHIP_LABELS.map((label) => (
          <span key={label} style={CHIP_STYLE}>
            {label}
          </span>
        ))}
      </div>
      <div ref={logRef} role="region" aria-label="Log" style={SCROLLER_STYLE}>
        <ScrollRows prefix="Log line" count={20} />
      </div>
      <div
        ref={echoTargetRef}
        role="region"
        aria-label="Echo target"
        style={SCROLLER_STYLE}
      >
        <ScrollRows prefix="Echo line" count={20} />
      </div>
      <div
        role="region"
        aria-label="Keyboard scroller"
        tabIndex={0}
        style={SCROLLER_STYLE}
        onKeyDown={() => setKeyboardScrollKeys((count) => count + 1)}
      >
        <ScrollRows prefix="Keyboard line" count={20} />
      </div>
      <div ref={detachableContainerRef}>
        <div
          ref={detachableScrollerRef}
          role="region"
          aria-label="Detachable scroller"
          style={SCROLLER_STYLE}
        >
          <ScrollRows prefix="Detachable row" count={20} />
        </div>
      </div>
      {createPortal(
        <div
          ref={portalScrollerRef}
          role="region"
          aria-label="Portal scroller"
          style={SCROLLER_STYLE}
        >
          <ScrollRows prefix="Portal line" count={20} />
        </div>,
        document.body,
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'f390c7e8-d8ae-4c7d-9b7e-35d9aaabca45',
  name: 'scroll-commands',
  description:
    'Scroll writes, scrollTo and scrollIntoView on owned scrollers in the sandbox',
  component: ScrollCommandsComponent,
});
