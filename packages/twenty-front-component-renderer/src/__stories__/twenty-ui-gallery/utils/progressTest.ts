import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

const expectRingGeometry = ({
  ring,
  fraction,
}: {
  ring: HTMLElement;
  fraction: number;
}) => {
  const circle = ring.querySelector('circle:last-child');
  if (!isDefined(circle)) {
    throw new Error('Progress ring indicator is missing');
  }

  const circumference = Number(circle.getAttribute('stroke-dasharray'));
  const offset = Number(circle.getAttribute('stroke-dashoffset'));
  expect(circumference).toBeGreaterThan(0);
  expect(offset / circumference).toBeCloseTo(1 - fraction, 5);
};

const expectProgressGeometry = ({
  bar,
  ring,
  indicator,
  fraction,
}: {
  bar: HTMLElement;
  ring: HTMLElement;
  indicator: HTMLElement;
  fraction: number;
}) => {
  const barIndicator = bar.querySelector<HTMLElement>('div > div');
  if (!isDefined(barIndicator)) {
    throw new Error('Progress bar indicator is missing');
  }

  expect(indicator.style.width).toBe(`${fraction * 100}%`);
  expect(barIndicator.style.width).toBe(`${fraction * 100}%`);
  expectRingGeometry({ ring, fraction });
};

const expectProgressValues = ({
  roots,
  value,
  min,
  max,
  valueText,
}: {
  roots: HTMLElement[];
  value: number;
  min: number;
  max: number;
  valueText: string;
}) => {
  for (const root of roots) {
    expect(root).toHaveAttribute('aria-valuenow', String(value));
    expect(root).toHaveAttribute('aria-valuemin', String(min));
    expect(root).toHaveAttribute('aria-valuemax', String(max));
    expect(root).toHaveAttribute('aria-valuetext', valueText);
  }
};

export const progressTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const bar = canvas.getByRole('progressbar', { name: 'Import bar' });
  const ring = canvas.getByRole('progressbar', { name: 'Import ring' });
  const composed = await canvas.findByRole('progressbar', {
    name: 'Composed records',
  });
  const indicator = canvas.getByLabelText('Composed indicator');
  const track = canvas.getByLabelText('Composed track');
  const value = canvas.getByLabelText('Composed value');
  const label = canvas.getByText('Composed records');
  const roots = [bar, ring, composed];

  expectProgressValues({
    roots,
    value: 25,
    min: 10,
    max: 70,
    valueText: '25%',
  });
  expectProgressGeometry({ bar, ring, indicator, fraction: 0.25 });
  expect(value).toHaveTextContent('25% of records');
  expect(value).toHaveAttribute('aria-hidden', 'true');
  expect(composed).toHaveAttribute('aria-labelledby', label.id);
  expect(composed).toHaveAttribute('data-composed', 'parts');
  expect(track).toHaveAttribute('data-composed', 'track');
  expect(indicator).toHaveAttribute('data-render-status', 'progressing');
  expect(ring).toHaveAttribute('data-render-status', 'progressing');

  expect(bar.tagName).toBe('SECTION');
  expect(bar).toHaveAttribute('id', 'import-bar');
  expect(bar).toHaveAttribute('title', 'Import bar title');
  expect(bar).toHaveAttribute('lang', 'fr');
  expect(bar).toHaveClass('custom-progress-bar');
  expect(bar).toHaveStyle({ marginTop: '7px' });
  expect(ring.tagName).toBe('ARTICLE');
  expect(ring).toHaveAttribute('id', 'import-ring');
  expect(ring).toHaveAttribute('title', 'Import ring title');
  expect(ring).toHaveAttribute('lang', 'fr');
  expect(ring).toHaveClass('custom-progress-ring');
  expect(ring).toHaveStyle({ marginTop: '9px' });
  const decorativeSvg = ring.querySelector('svg');
  if (!isDefined(decorativeSvg)) {
    throw new Error('Decorative progress SVG is missing');
  }

  expect(decorativeSvg).toHaveAttribute('aria-hidden', 'true');
  expect(decorativeSvg.tabIndex).toBe(-1);

  await waitFor(() => {
    expect(bar).toHaveAttribute('data-ref-tag', 'HTML-SECTION');
    expect(ring).toHaveAttribute('data-ref-tag', 'HTML-ARTICLE');
    expect(composed).toHaveAttribute('data-ref-tag', 'HTML-SECTION');
    expect(track).toHaveAttribute('data-ref-tag', 'HTML-DIV');
    expect(indicator).toHaveAttribute('data-ref-tag', 'HTML-DIV');
    expect(label).toHaveAttribute('data-ref-tag', 'HTML-STRONG');
    expect(value).toHaveAttribute('data-ref-tag', 'HTML-OUTPUT');
  });
  await userEvent.tab();
  expect(
    canvas.getByRole('button', { name: 'Advance progress' }),
  ).toHaveFocus();
  expect(decorativeSvg).not.toHaveFocus();
  await userEvent.hover(bar);
  await waitFor(() =>
    expect(canvas.getByLabelText('Progress pointer entries')).toHaveTextContent(
      '1',
    ),
  );

  const compact = canvas.getByRole('progressbar', { name: 'Compact progress' });
  const compactIndicator = compact.firstElementChild?.firstElementChild;
  if (!isDefined(compactIndicator)) {
    throw new Error('Compact bar indicator is missing');
  }

  expect(compact).toHaveAttribute('aria-valuenow', '1');
  await waitFor(() => {
    expect(compactIndicator.getBoundingClientRect().width).toBe(4);
    expect(compactIndicator.getBoundingClientRect().width).toBeLessThan(
      compact.getBoundingClientRect().width,
    );
  });

  const storage = canvas.getByRole('progressbar', { name: 'Storage' });
  expect(storage).toHaveAttribute('aria-valuenow', '25');
  expect(storage).toHaveAttribute('aria-valuetext', '25 of 100 gigabytes used');
  expect(canvas.getByText('25 / 100 GB')).toBeVisible();
  expect(canvas.getByText('0')).toBeVisible();
  expect(canvas.getAllByRole('progressbar')).toHaveLength(7);
  expect(
    canvas.getByRole('progressbar', { name: 'Empty progress' }),
  ).toHaveAttribute('aria-valuenow', '0');
  expect(
    canvas.getByRole('progressbar', { name: 'Complete progress' }),
  ).toHaveAttribute('aria-valuenow', '100');

  await userEvent.click(
    canvas.getByRole('button', { name: 'Advance progress' }),
  );
  await waitFor(() => {
    expectProgressValues({
      roots,
      value: 55,
      min: 10,
      max: 70,
      valueText: '75%',
    });
    expectProgressGeometry({ bar, ring, indicator, fraction: 0.75 });
    expect(value).toHaveTextContent('75% of records');
    expect(within(ring).getByText('55 records')).toBeVisible();
  });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Change progress range' }),
  );
  await waitFor(() => {
    expectProgressValues({
      roots,
      value: 55,
      min: 30,
      max: 130,
      valueText: '25%',
    });
    expectProgressGeometry({ bar, ring, indicator, fraction: 0.25 });
    expect(value).toHaveTextContent('25% of records');
  });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Wait for records' }),
  );
  await waitFor(() => {
    for (const root of roots) {
      expect(root).not.toHaveAttribute('aria-valuenow');
      expect(root).toHaveAttribute('aria-valuetext', 'indeterminate progress');
      expect(root).toHaveAttribute('data-indeterminate');
    }
    expect(indicator).toHaveAttribute('data-render-status', 'indeterminate');
    expect(indicator.style.width).toBe('');
    expectRingGeometry({ ring, fraction: 0.25 });
    const ringIndicator = ring.querySelector('[data-indeterminate]');
    if (!isDefined(ringIndicator)) {
      throw new Error('Indeterminate ring indicator is missing');
    }
    expect(getComputedStyle(ringIndicator).animationName).not.toBe('none');
    expect(bar.querySelector('div > div')).not.toHaveAttribute(
      'data-minimum-fill',
    );
    expect(ring).toHaveAttribute('data-render-status', 'indeterminate');
    expect(value).toHaveTextContent('Waiting');
    expect(within(ring).getByText('Waiting for records')).toBeVisible();
  });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Complete import' }),
  );
  await waitFor(() => {
    expectProgressValues({
      roots,
      value: 130,
      min: 30,
      max: 130,
      valueText: '100%',
    });
    for (const root of roots) {
      expect(root).toHaveAttribute('data-complete');
      expect(root).not.toHaveAttribute('data-indeterminate');
    }
    expectProgressGeometry({ bar, ring, indicator, fraction: 1 });
    const barIndicator = bar.querySelector('div > div');
    if (!isDefined(barIndicator)) {
      throw new Error('Complete bar indicator is missing');
    }
    expect(barIndicator).not.toHaveAttribute('data-minimum-fill');
    expect(barIndicator.getBoundingClientRect().width).toBeCloseTo(
      bar.getBoundingClientRect().width,
      1,
    );
    expect(value).toHaveTextContent('100% of records');
  });

  await userEvent.click(canvas.getByRole('button', { name: 'Reset import' }));
  await waitFor(() => {
    expectProgressValues({
      roots,
      value: 30,
      min: 30,
      max: 130,
      valueText: '0%',
    });
    expectProgressGeometry({ bar, ring, indicator, fraction: 0 });
    const barIndicator = bar.querySelector('div > div');
    if (!isDefined(barIndicator)) {
      throw new Error('Empty bar indicator is missing');
    }
    expect(barIndicator).not.toHaveAttribute('data-minimum-fill');
    expect(barIndicator.getBoundingClientRect().width).toBe(0);
    expect(ring.querySelector('circle:last-child')).toHaveAttribute(
      'stroke-linecap',
      'butt',
    );
    expect(value).toHaveTextContent('0% of records');
  });
  expect(errorHandler).not.toHaveBeenCalled();
};
