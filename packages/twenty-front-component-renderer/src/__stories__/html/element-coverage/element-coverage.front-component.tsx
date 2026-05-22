import { type ReactNode, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { EventLog, useEventLog } from '../../shared/front-components/event-log';
import {
  FrontComponentCard,
  UnknownScenario,
} from '../../shared/front-components/front-component-card';
import { type HtmlElementName } from '../../shared/front-components/html-element-names';

type Wrapper = (children: ReactNode) => ReactNode;

const FILL_RECT_STYLE = {
  width: '100%',
  height: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '8px 12px',
  display: 'block',
  boxSizing: 'border-box' as const,
};

const FILL_INLINE_STYLE = {
  display: 'inline-block',
  minWidth: 80,
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
};

const FILL_BUTTON_STYLE = {
  ...FILL_INLINE_STYLE,
  padding: '8px 16px',
  cursor: 'pointer',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
};

const FILL_TABLE_CELL_STYLE = {
  minWidth: 80,
  minHeight: 32,
  padding: '8px 12px',
  border: '1px solid #d1d5db',
};

const SVG_ROOT_STYLE = {
  width: 200,
  height: 120,
  border: '1px solid #d1d5db',
};

const tableWrapper: Wrapper = (children) => (
  <table>
    <tbody>
      <tr>{children}</tr>
    </tbody>
  </table>
);

const tableSectionWrapper: Wrapper = (children) => (
  <table style={{ width: 200 }}>{children}</table>
);

const tableRowWrapper: Wrapper = (children) => (
  <table style={{ width: 200 }}>
    <tbody>{children}</tbody>
  </table>
);

const tableColgroupWrapper: Wrapper = (children) => (
  <table style={{ width: 200 }}>
    <colgroup>{children}</colgroup>
    <tbody>
      <tr>
        <td>cell</td>
      </tr>
    </tbody>
  </table>
);

const tableCaptionWrapper: Wrapper = (children) => (
  <table style={{ width: 200 }}>
    {children}
    <tbody>
      <tr>
        <td>cell</td>
      </tr>
    </tbody>
  </table>
);

const selectWrapper: Wrapper = (children) => (
  <select defaultValue="alpha">{children}</select>
);

const detailsWrapper: Wrapper = (children) => (
  <details open>{children}</details>
);

const fieldsetWrapper: Wrapper = (children) => <fieldset>{children}</fieldset>;

const figureWrapper: Wrapper = (children) => <figure>{children}</figure>;

const dlWrapper: Wrapper = (children) => <dl>{children}</dl>;

const rubyWrapper: Wrapper = (children) => <ruby>kanji{children}</ruby>;

const svgWrapper: Wrapper = (children) => (
  <svg viewBox="0 0 200 120" style={SVG_ROOT_STYLE}>
    {children}
  </svg>
);

const datalistInputWrapper: Wrapper = (children) => (
  <>
    <input list="probe-list" />
    {children}
  </>
);

const optgroupWrapper: Wrapper = (children) => (
  <select defaultValue="x">
    <optgroup label="group">{children}</optgroup>
  </select>
);

type SubjectRenderer = (subject: SubjectProps) => ReactNode;

type SubjectProps = {
  testId: string;
  onClick: (event: unknown) => void;
  onFocus: (event: unknown) => void;
  onBlur: (event: unknown) => void;
  tabIndex: number;
};

type ElementSpec = {
  tag: string;
  wrapper?: Wrapper;
  render: SubjectRenderer;
};

const renderBlockText = (tag: keyof JSX.IntrinsicElements): SubjectRenderer =>
  function BlockTextSubject(props) {
    const Tag = tag as unknown as 'div';
    return (
      <Tag
        data-testid={props.testId}
        onClick={props.onClick}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        tabIndex={props.tabIndex}
        style={FILL_RECT_STYLE}
      >
        {tag}
      </Tag>
    );
  };

const renderInlineText = (tag: keyof JSX.IntrinsicElements): SubjectRenderer =>
  function InlineTextSubject(props) {
    const Tag = tag as unknown as 'span';
    return (
      <Tag
        data-testid={props.testId}
        onClick={props.onClick}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        tabIndex={props.tabIndex}
        style={FILL_INLINE_STYLE}
      >
        {tag}
      </Tag>
    );
  };

const renderVoidBox = (
  tag: keyof JSX.IntrinsicElements,
  style: Record<string, unknown> = FILL_RECT_STYLE,
): SubjectRenderer =>
  function VoidSubject(props) {
    const Tag = tag as unknown as 'br';
    return (
      <Tag
        data-testid={props.testId}
        onClick={props.onClick}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        tabIndex={props.tabIndex}
        style={style}
      />
    );
  };

const ELEMENT_REGISTRY: Record<HtmlElementName, ElementSpec> = {
  div: { tag: 'div', render: renderBlockText('div') },
  span: { tag: 'span', render: renderInlineText('span') },
  section: { tag: 'section', render: renderBlockText('section') },
  article: { tag: 'article', render: renderBlockText('article') },
  header: { tag: 'header', render: renderBlockText('header') },
  footer: { tag: 'footer', render: renderBlockText('footer') },
  main: { tag: 'main', render: renderBlockText('main') },
  nav: { tag: 'nav', render: renderBlockText('nav') },
  aside: { tag: 'aside', render: renderBlockText('aside') },
  p: { tag: 'p', render: renderBlockText('p') },
  h1: { tag: 'h1', render: renderBlockText('h1') },
  h2: { tag: 'h2', render: renderBlockText('h2') },
  h3: { tag: 'h3', render: renderBlockText('h3') },
  h4: { tag: 'h4', render: renderBlockText('h4') },
  h5: { tag: 'h5', render: renderBlockText('h5') },
  h6: { tag: 'h6', render: renderBlockText('h6') },
  hgroup: { tag: 'hgroup', render: renderBlockText('hgroup') },
  address: { tag: 'address', render: renderBlockText('address') },
  search: { tag: 'search', render: renderBlockText('search') },
  strong: { tag: 'strong', render: renderInlineText('strong') },
  em: { tag: 'em', render: renderInlineText('em') },
  small: { tag: 'small', render: renderInlineText('small') },
  code: { tag: 'code', render: renderInlineText('code') },
  pre: { tag: 'pre', render: renderBlockText('pre') },
  blockquote: { tag: 'blockquote', render: renderBlockText('blockquote') },
  b: { tag: 'b', render: renderInlineText('b') },
  i: { tag: 'i', render: renderInlineText('i') },
  u: { tag: 'u', render: renderInlineText('u') },
  s: { tag: 's', render: renderInlineText('s') },
  mark: { tag: 'mark', render: renderInlineText('mark') },
  sub: { tag: 'sub', render: renderInlineText('sub') },
  sup: { tag: 'sup', render: renderInlineText('sup') },
  abbr: { tag: 'abbr', render: renderInlineText('abbr') },
  cite: { tag: 'cite', render: renderInlineText('cite') },
  kbd: { tag: 'kbd', render: renderInlineText('kbd') },
  samp: { tag: 'samp', render: renderInlineText('samp') },
  var: { tag: 'var', render: renderInlineText('var') },
  dfn: { tag: 'dfn', render: renderInlineText('dfn') },
  bdi: { tag: 'bdi', render: renderInlineText('bdi') },
  bdo: { tag: 'bdo', render: renderInlineText('bdo') },
  data: { tag: 'data', render: renderInlineText('data') },
  del: { tag: 'del', render: renderInlineText('del') },
  ins: { tag: 'ins', render: renderInlineText('ins') },
  q: { tag: 'q', render: renderInlineText('q') },
  time: { tag: 'time', render: renderInlineText('time') },
  ul: { tag: 'ul', render: renderBlockText('ul') },
  ol: { tag: 'ol', render: renderBlockText('ol') },
  li: { tag: 'li', render: renderInlineText('li') },
  dl: { tag: 'dl', render: renderBlockText('dl') },
  dt: { tag: 'dt', wrapper: dlWrapper, render: renderBlockText('dt') },
  dd: { tag: 'dd', wrapper: dlWrapper, render: renderBlockText('dd') },
  figure: { tag: 'figure', render: renderBlockText('figure') },
  figcaption: {
    tag: 'figcaption',
    wrapper: figureWrapper,
    render: renderBlockText('figcaption'),
  },
  ruby: { tag: 'ruby', render: renderInlineText('ruby') },
  rt: { tag: 'rt', wrapper: rubyWrapper, render: renderInlineText('rt') },
  rp: { tag: 'rp', wrapper: rubyWrapper, render: renderInlineText('rp') },
  details: { tag: 'details', render: renderBlockText('details') },
  summary: {
    tag: 'summary',
    wrapper: detailsWrapper,
    render: renderBlockText('summary'),
  },
  dialog: {
    tag: 'dialog',
    render(props) {
      return (
        <dialog
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          open
          style={FILL_RECT_STYLE}
        >
          dialog
        </dialog>
      );
    },
  },
  a: {
    tag: 'a',
    render(props) {
      return (
        <a
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_INLINE_STYLE}
        >
          link
        </a>
      );
    },
  },
  button: {
    tag: 'button',
    render(props) {
      return (
        <button
          data-testid={props.testId}
          type="button"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_BUTTON_STYLE}
        >
          button
        </button>
      );
    },
  },
  label: { tag: 'label', render: renderInlineText('label') },
  form: {
    tag: 'form',
    render(props) {
      return (
        <form
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_RECT_STYLE}
        >
          form body
        </form>
      );
    },
  },
  fieldset: { tag: 'fieldset', render: renderBlockText('fieldset') },
  legend: {
    tag: 'legend',
    wrapper: fieldsetWrapper,
    render: renderInlineText('legend'),
  },
  output: { tag: 'output', render: renderInlineText('output') },
  progress: {
    tag: 'progress',
    render(props) {
      return (
        <progress
          data-testid={props.testId}
          value={30}
          max={100}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_INLINE_STYLE}
        />
      );
    },
  },
  meter: {
    tag: 'meter',
    render(props) {
      return (
        <meter
          data-testid={props.testId}
          value={0.5}
          min={0}
          max={1}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_INLINE_STYLE}
        />
      );
    },
  },
  option: {
    tag: 'option',
    wrapper: selectWrapper,
    render(props) {
      return (
        <>
          <option
            data-testid={props.testId}
            value="alpha"
            onClick={props.onClick}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
          >
            alpha
          </option>
          <option value="beta">beta</option>
        </>
      );
    },
  },
  optgroup: {
    tag: 'optgroup',
    wrapper: optgroupWrapper,
    render(props) {
      return (
        <option
          data-testid={props.testId}
          value="x"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
        >
          inside
        </option>
      );
    },
  },
  datalist: {
    tag: 'datalist',
    wrapper: datalistInputWrapper,
    render(props) {
      return (
        <datalist
          id="probe-list"
          data-testid={props.testId}
          onClick={props.onClick}
        >
          <option value="alpha" />
          <option value="beta" />
        </datalist>
      );
    },
  },
  table: { tag: 'table', render: renderBlockText('table') },
  thead: {
    tag: 'thead',
    wrapper: tableSectionWrapper,
    render(props) {
      return (
        <thead
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        >
          <tr>
            <th style={FILL_TABLE_CELL_STYLE}>thead</th>
          </tr>
        </thead>
      );
    },
  },
  tbody: {
    tag: 'tbody',
    wrapper: tableSectionWrapper,
    render(props) {
      return (
        <tbody
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        >
          <tr>
            <td style={FILL_TABLE_CELL_STYLE}>tbody</td>
          </tr>
        </tbody>
      );
    },
  },
  tfoot: {
    tag: 'tfoot',
    wrapper: tableSectionWrapper,
    render(props) {
      return (
        <tfoot
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        >
          <tr>
            <td style={FILL_TABLE_CELL_STYLE}>tfoot</td>
          </tr>
        </tfoot>
      );
    },
  },
  tr: {
    tag: 'tr',
    wrapper: tableRowWrapper,
    render(props) {
      return (
        <tr
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        >
          <td style={FILL_TABLE_CELL_STYLE}>row</td>
        </tr>
      );
    },
  },
  th: {
    tag: 'th',
    wrapper: tableWrapper,
    render(props) {
      return (
        <th
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_TABLE_CELL_STYLE}
        >
          th
        </th>
      );
    },
  },
  td: {
    tag: 'td',
    wrapper: tableWrapper,
    render(props) {
      return (
        <td
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_TABLE_CELL_STYLE}
        >
          td
        </td>
      );
    },
  },
  caption: {
    tag: 'caption',
    wrapper: tableCaptionWrapper,
    render(props) {
      return (
        <caption
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        >
          caption
        </caption>
      );
    },
  },
  colgroup: {
    tag: 'colgroup',
    wrapper: tableColgroupWrapper,
    render(props) {
      return (
        <col
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
  hr: {
    tag: 'hr',
    render: renderVoidBox('hr', { ...FILL_RECT_STYLE, height: 16 }),
  },
  img: {
    tag: 'img',
    render(props) {
      return (
        <img
          data-testid={props.testId}
          src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'/>"
          alt="probe"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={{ ...FILL_RECT_STYLE, height: 40 }}
        />
      );
    },
  },
  picture: {
    tag: 'picture',
    render(props) {
      return (
        <picture
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={FILL_RECT_STYLE}
        >
          <img
            src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'/>"
            alt="probe"
          />
        </picture>
      );
    },
  },
  iframe: {
    tag: 'iframe',
    render(props) {
      return (
        <iframe
          data-testid={props.testId}
          title="probe"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={{ ...FILL_RECT_STYLE, height: 80 }}
        />
      );
    },
  },
  menu: { tag: 'menu', render: renderBlockText('menu') },
  svg: {
    tag: 'svg',
    render(props) {
      return (
        <svg
          data-testid={props.testId}
          viewBox="0 0 200 120"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
          style={SVG_ROOT_STYLE}
        >
          <rect x="20" y="20" width="160" height="80" fill="#2563eb" />
        </svg>
      );
    },
  },
  g: {
    tag: 'g',
    wrapper: svgWrapper,
    render(props) {
      return (
        <g
          data-testid={props.testId}
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        >
          <rect x="20" y="20" width="160" height="80" fill="#2563eb" />
        </g>
      );
    },
  },
  circle: {
    tag: 'circle',
    wrapper: svgWrapper,
    render(props) {
      return (
        <circle
          data-testid={props.testId}
          cx="100"
          cy="60"
          r="40"
          fill="#2563eb"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
  ellipse: {
    tag: 'ellipse',
    wrapper: svgWrapper,
    render(props) {
      return (
        <ellipse
          data-testid={props.testId}
          cx="100"
          cy="60"
          rx="80"
          ry="40"
          fill="#2563eb"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
  rect: {
    tag: 'rect',
    wrapper: svgWrapper,
    render(props) {
      return (
        <rect
          data-testid={props.testId}
          x="20"
          y="20"
          width="160"
          height="80"
          fill="#2563eb"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
  line: {
    tag: 'line',
    wrapper: svgWrapper,
    render(props) {
      return (
        <line
          data-testid={props.testId}
          x1="20"
          y1="60"
          x2="180"
          y2="60"
          stroke="#2563eb"
          strokeWidth="20"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
  path: {
    tag: 'path',
    wrapper: svgWrapper,
    render(props) {
      return (
        <path
          data-testid={props.testId}
          d="M20 20 L180 20 L180 100 L20 100 Z"
          fill="#2563eb"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
  polygon: {
    tag: 'polygon',
    wrapper: svgWrapper,
    render(props) {
      return (
        <polygon
          data-testid={props.testId}
          points="100,20 180,100 20,100"
          fill="#2563eb"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
  polyline: {
    tag: 'polyline',
    wrapper: svgWrapper,
    render(props) {
      return (
        <polyline
          data-testid={props.testId}
          points="20,80 100,20 180,80"
          stroke="#2563eb"
          strokeWidth="20"
          fill="none"
          onClick={props.onClick}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          tabIndex={props.tabIndex}
        />
      );
    },
  },
};

const parseScenarioId = (
  scenarioId: string,
): { elementName: string; eventName: string } | null => {
  const parts = scenarioId.split(':');

  if (parts.length !== 3 || parts[0] !== 'baseline') {
    return null;
  }

  return { elementName: parts[1], eventName: parts[2] };
};

type ScenarioProps = {
  spec: ElementSpec;
  eventName: 'click' | 'focus-blur';
};

const BaselineScenario = ({ spec, eventName }: ScenarioProps) => {
  const [interactionCount, setInteractionCount] = useState(0);
  const { entries, pushEvent } = useEventLog();

  const handleClick = (event: unknown) => {
    if (eventName === 'click') {
      setInteractionCount((previous) => previous + 1);
      pushEvent(event as never);
    }
  };

  const handleFocus = (event: unknown) => {
    if (eventName === 'focus-blur') {
      setInteractionCount((previous) => previous + 1);
      pushEvent(event as never);
    }
  };

  const handleBlur = (event: unknown) => {
    if (eventName === 'focus-blur') {
      pushEvent(event as never);
    }
  };

  const subject = spec.render({
    testId: 'subject',
    onClick: handleClick,
    onFocus: handleFocus,
    onBlur: handleBlur,
    tabIndex: 0,
  });

  const wrapped = spec.wrapper !== undefined ? spec.wrapper(subject) : subject;

  return (
    <>
      {wrapped}
      <span data-testid="front-component-value">{interactionCount}</span>
      <EventLog entries={entries} />
    </>
  );
};

const ElementCoverageFrontComponent = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  const parsed = parseScenarioId(scenarioId);

  if (parsed === null) {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  const spec = (ELEMENT_REGISTRY as Record<string, ElementSpec | undefined>)[
    parsed.elementName
  ];

  if (spec === undefined) {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  if (parsed.eventName !== 'click' && parsed.eventName !== 'focus-blur') {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  return (
    <FrontComponentCard scenarioId={scenarioId}>
      <BaselineScenario spec={spec} eventName={parsed.eventName} />
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-cvrg-00000000-0000-0000-0000-000000000020',
  name: 'element-coverage-front-component',
  description:
    'Front component covering baseline click/focus events on every HTML element',
  component: ElementCoverageFrontComponent,
});
