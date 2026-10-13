import { readComputedStyleProperties } from '@/host/geometry/utils/readComputedStyleProperties';

const TEXTAREA_MEASUREMENT_STYLE_PROPERTIES = [
  'box-sizing',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'font-stretch',
  'font-variant-caps',
  'font-variant-east-asian',
  'font-variant-ligatures',
  'font-variant-numeric',
  'font-variant-position',
  'font-variant-alternates',
  'font-kerning',
  'font-feature-settings',
  'font-variation-settings',
  'font-optical-sizing',
  'font-size-adjust',
  'font-synthesis-weight',
  'font-synthesis-style',
  'font-synthesis-small-caps',
  'line-height',
  'letter-spacing',
  'word-spacing',
  'text-indent',
  'text-transform',
  'text-rendering',
  'white-space',
  'word-break',
  'overflow-wrap',
  'hyphens',
  'line-break',
  'tab-size',
  'writing-mode',
  'direction',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'width',
  'min-height',
  'max-height',
  'overflow-x',
  'overflow-y',
] as const;

export const measureTextareaIntrinsicScrollHeight = (
  node: Element,
): number | undefined => {
  if (
    !(node instanceof HTMLTextAreaElement) ||
    !node.hasAttribute('data-auto-resize')
  ) {
    return undefined;
  }

  const measurementStyles = readComputedStyleProperties({
    node,
    propertyNames: TEXTAREA_MEASUREMENT_STYLE_PROPERTIES,
  });
  const measurement = node.ownerDocument.createElement('textarea');
  measurement.value = node.value;
  measurement.rows = node.rows;
  measurement.wrap = node.wrap;
  measurement.placeholder = node.placeholder;

  for (const [propertyName, value] of Object.entries(measurementStyles)) {
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
    return measurement.scrollHeight;
  } finally {
    measurement.remove();
  }
};
