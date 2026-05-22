import { type ReactNode } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { useFrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { ProbeCard, UnknownScenario } from './shared/probe-card';
import { PROPERTY_FIXTURE } from './shared/property-fixture';

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
  'property:div': () => renderCommon('div'),
  'property:span': () => renderCommon('span'),
  'property:section': () => renderCommon('section'),
  'property:article': () => renderCommon('article'),
  'property:p': () => renderCommon('p'),
  'property:h1': () => renderCommon('h1'),
  'property:button': () => renderCommon('button'),
  'property:label': () => renderCommon('label'),
  'property:nav': () => renderCommon('nav'),
  'property:aside': () => renderCommon('aside'),
  'property:input.text': () => (
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
  'property:input.number': () => (
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
  'property:textarea': () => (
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
  'property:select': () => (
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
  'property:a': () => (
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
  'property:img': () => (
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
  'property:progress': () => (
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
  'property:meter': () => (
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
  'property:form': () => (
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
  'property:fieldset': () => (
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
  'property:details': () => (
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

const PropertyReflectionProbe = () => {
  const scenarioId = useFrontComponentExecutionContext(
    (context) => context.frontComponentId,
  );

  const render = SCENARIOS[scenarioId];

  if (render === undefined) {
    return <UnknownScenario scenarioId={scenarioId} />;
  }

  return <ProbeCard scenarioId={scenarioId}>{render()}</ProbeCard>;
};

export default defineFrontComponent({
  universalIdentifier: 'probe-prop-00000000-0000-0000-0000-000000000020',
  name: 'property-reflection-probe',
  description: 'Probe component covering property reflection per element',
  component: PropertyReflectionProbe,
});
