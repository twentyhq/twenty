import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PROPERTY_FIXTURE } from './property-fixture';

const noop = () => undefined;

const renderCommon = (
  tag:
    | 'div'
    | 'span'
    | 'section'
    | 'article'
    | 'p'
    | 'h1'
    | 'button'
    | 'label'
    | 'nav'
    | 'aside',
): ReactNode => {
  const Tag = tag as unknown as 'div';
  return (
    <Tag
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
    >
      content
    </Tag>
  );
};

const SCENARIOS: Record<string, () => ReactNode> = {
  div: () => renderCommon('div'),
  span: () => renderCommon('span'),
  section: () => renderCommon('section'),
  article: () => renderCommon('article'),
  p: () => renderCommon('p'),
  h1: () => renderCommon('h1'),
  button: () => renderCommon('button'),
  label: () => renderCommon('label'),
  nav: () => renderCommon('nav'),
  aside: () => renderCommon('aside'),
  'input.text': () => (
    <input
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      type={PROPERTY_FIXTURE.type}
      name={PROPERTY_FIXTURE.name}
      placeholder={PROPERTY_FIXTURE.placeholder}
      value={PROPERTY_FIXTURE.textValue}
      onChange={noop}
    />
  ),
  'input.number': () => (
    <input
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      type="number"
      name={PROPERTY_FIXTURE.name}
      value={String(PROPERTY_FIXTURE.numberValue)}
      onChange={noop}
    />
  ),
  textarea: () => (
    <textarea
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      name={PROPERTY_FIXTURE.name}
      placeholder={PROPERTY_FIXTURE.placeholder}
      rows={PROPERTY_FIXTURE.rows}
      cols={PROPERTY_FIXTURE.cols}
      value={PROPERTY_FIXTURE.textValue}
      onChange={noop}
    />
  ),
  select: () => (
    <select
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      name={PROPERTY_FIXTURE.name}
      value="alpha"
      onChange={noop}
    >
      <option value="alpha">alpha</option>
      <option value="beta">beta</option>
    </select>
  ),
  a: () => (
    <a
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      href={PROPERTY_FIXTURE.href}
      onClick={(event) => {
        (
          event as unknown as { preventDefault?: () => void }
        ).preventDefault?.();
      }}
    >
      link
    </a>
  ),
  img: () => (
    <img
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      src={PROPERTY_FIXTURE.src}
      alt={PROPERTY_FIXTURE.alt}
    />
  ),
  progress: () => (
    <progress
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      value={30}
      max={PROPERTY_FIXTURE.max}
    />
  ),
  meter: () => (
    <meter
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      value={0.5}
      min={0}
      max={1}
    />
  ),
  form: () => (
    <form
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
    >
      form
    </form>
  ),
  fieldset: () => (
    <fieldset
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
    >
      field
    </fieldset>
  ),
  details: () => (
    <details
      data-testid="subject"
      id={PROPERTY_FIXTURE.id}
      className={PROPERTY_FIXTURE.className}
      title={PROPERTY_FIXTURE.title}
      role={PROPERTY_FIXTURE.role}
      aria-label={PROPERTY_FIXTURE.ariaLabel}
      tabIndex={PROPERTY_FIXTURE.tabIndex}
      open
    >
      <summary>summary</summary>
      content
    </details>
  ),
};

export type PropertyReflectionVariant = keyof typeof SCENARIOS;

type PropertyReflectionScenarioProps = {
  variant: PropertyReflectionVariant;
};

export const PropertyReflectionScenario = ({
  variant,
}: PropertyReflectionScenarioProps): ReactNode => {
  const render = SCENARIOS[variant];

  if (!isDefined(render)) {
    return null;
  }

  return render();
};
