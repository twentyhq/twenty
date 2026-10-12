import { type CSSProperties, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { defineFrontComponent } from 'twenty-sdk/define';

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

const formatLabel = ({
  prefix,
  index,
}: {
  prefix: string;
  index: number;
}): string => `${prefix} ${String(index + 1).padStart(2, '0')}`;

const ScrollRows = ({ prefix, count }: { prefix: string; count: number }) => (
  <>
    {Array.from({ length: count }, (_, index) => (
      <div key={index} style={ROW_STYLE}>
        {formatLabel({ prefix, index })}
      </div>
    ))}
  </>
);

const ScrollCommandsComponent = () => {
  const innerScrollerRef = useRef<HTMLDivElement>(null);
  const rtlChipsRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const echoTargetRef = useRef<HTMLDivElement>(null);
  const portalScrollerRef = useRef<HTMLDivElement>(null);
  const detachableContainerRef = useRef<HTMLDivElement>(null);
  const detachableScrollerRef = useRef<HTMLDivElement>(null);
  const [logReads, setLogReads] = useState('none');
  const [chipReads, setChipReads] = useState('none');
  const [portalRead, setPortalRead] = useState('none');
  const [pageScrollStatus, setPageScrollStatus] = useState('none');
  const [keyboardScrollKeys, setKeyboardScrollKeys] = useState(0);

  const findRow = (rowName: string): Element | undefined =>
    Array.from(innerScrollerRef.current?.children ?? []).find(
      (row) => row.textContent === rowName,
    );

  const findChip = (chipName: string): Element | undefined =>
    Array.from(rtlChipsRef.current?.children ?? []).find(
      (chip) => chip.textContent === chipName,
    );

  const writeLog = () => {
    const log = logRef.current;

    if (log === null) {
      return;
    }

    log.scrollTop = 120;
    const synchronousRead = log.scrollTop;

    requestAnimationFrame(() =>
      setLogReads(`sync:${synchronousRead};next:${log.scrollTop}`),
    );
  };

  const writeChips = () => {
    const rtlChips = rtlChipsRef.current;

    if (rtlChips === null) {
      return;
    }

    rtlChips.scrollLeft = -120;
    const synchronousRead = rtlChips.scrollLeft;

    requestAnimationFrame(() =>
      setChipReads(`sync:${synchronousRead};next:${rtlChips.scrollLeft}`),
    );
  };

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
        <button
          type="button"
          onClick={() =>
            findRow('Row 25')?.scrollIntoView({ block: 'nearest' })
          }
        >
          Reveal row 25
        </button>
        <button
          type="button"
          onClick={() => findRow('Row 25')?.scrollIntoView({ block: 'center' })}
        >
          Center row 25
        </button>
        <button
          type="button"
          onClick={() =>
            findChip('Chip 18')?.scrollIntoView({
              block: 'nearest',
              inline: 'nearest',
            })
          }
        >
          Reveal chip 18
        </button>
        <button
          type="button"
          onClick={() =>
            findChip('Chip 18')?.scrollIntoView({
              block: 'nearest',
              inline: 'start',
            })
          }
        >
          Start chip 18
        </button>
        <button type="button" onClick={writeLog}>
          Write log 120
        </button>
        <button type="button" onClick={writeChips}>
          Write chips -120
        </button>
        <button
          type="button"
          onClick={() => {
            const echoTarget = echoTargetRef.current;

            if (echoTarget !== null) {
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

            if (detachableScroller === null) {
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

            if (detachableScroller === null) {
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
        ref={rtlChipsRef}
        dir="rtl"
        role="region"
        aria-label="RTL chips"
        style={{ inlineSize: 200, overflowX: 'auto', whiteSpace: 'nowrap' }}
      >
        {Array.from({ length: 20 }, (_, index) => (
          <span key={index} style={CHIP_STYLE}>
            {formatLabel({ prefix: 'Chip', index })}
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
