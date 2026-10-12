import { isDefined } from 'twenty-shared/utils';

const TEXTAREA_MEASUREMENT_STYLE_PROPERTIES = [
  'box-sizing',
  'font',
  'font-kerning',
  'font-feature-settings',
  'font-variation-settings',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-indent',
  'text-transform',
  'text-rendering',
  'white-space',
  'word-break',
  'overflow-wrap',
  'tab-size',
  'writing-mode',
  'direction',
  'padding',
  'border',
  'width',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'overflow-x',
  'overflow-y',
] as const;

const textareaMeasurements = new WeakMap<
  HTMLTextAreaElement,
  { contentSignature: string; scrollHeight: number }
>();

export const measureTextareaIntrinsicScrollHeight = (
  node: Element,
): number | undefined => {
  if (
    !(node instanceof HTMLTextAreaElement) ||
    !node.hasAttribute('data-auto-resize')
  ) {
    return undefined;
  }

  const computedStyle = getComputedStyle(node);
  const measurementStyles = TEXTAREA_MEASUREMENT_STYLE_PROPERTIES.map(
    (propertyName) =>
      [propertyName, computedStyle.getPropertyValue(propertyName)] as const,
  );
  const contentSignature = JSON.stringify({
    value: node.value,
    rows: node.rows,
    wrap: node.wrap,
    placeholder: node.placeholder,
    measurementStyles,
  });
  const previousMeasurement = textareaMeasurements.get(node);

  if (
    isDefined(previousMeasurement) &&
    previousMeasurement.contentSignature === contentSignature
  ) {
    return previousMeasurement.scrollHeight;
  }

  const measurement = node.ownerDocument.createElement('textarea');
  measurement.value = node.value;
  measurement.rows = node.rows;
  measurement.wrap = node.wrap;
  measurement.placeholder = node.placeholder;

  for (const [propertyName, value] of measurementStyles) {
    measurement.style.setProperty(propertyName, value);
  }

  Object.assign(measurement.style, {
    blockSize: 'auto',
    position: 'fixed',
    visibility: 'hidden',
    pointerEvents: 'none',
    left: '-10000px',
    top: '0',
    margin: '0',
  });

  node.ownerDocument.body.append(measurement);

  try {
    const scrollHeight = measurement.scrollHeight;
    textareaMeasurements.set(node, { contentSignature, scrollHeight });
    return scrollHeight;
  } finally {
    measurement.remove();
  }
};
