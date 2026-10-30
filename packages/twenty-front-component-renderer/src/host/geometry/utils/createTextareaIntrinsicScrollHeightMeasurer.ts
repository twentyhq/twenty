import { type TextareaIntrinsicScrollHeightMeasurer } from '@/host/geometry/types/TextareaIntrinsicScrollHeightMeasurer';
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

const createMeasurementTextarea = (
  ownerDocument: Document,
): HTMLTextAreaElement => {
  const measurementTextarea = ownerDocument.createElement('textarea');

  measurementTextarea.setAttribute('aria-hidden', 'true');
  measurementTextarea.tabIndex = -1;
  Object.assign(measurementTextarea.style, {
    blockSize: 'auto',
    position: 'fixed',
    visibility: 'hidden',
    pointerEvents: 'none',
    left: '-10000px',
    top: '0',
    margin: '0',
  });

  return measurementTextarea;
};

export const createTextareaIntrinsicScrollHeightMeasurer =
  (): TextareaIntrinsicScrollHeightMeasurer => {
    let measurementTextarea: HTMLTextAreaElement | null = null;
    const appliedStyleValues = new Map<string, string>();

    const resolveMeasurementTextarea = (
      ownerDocument: Document,
    ): HTMLTextAreaElement => {
      measurementTextarea ??= createMeasurementTextarea(ownerDocument);

      if (!measurementTextarea.isConnected) {
        ownerDocument.body.append(measurementTextarea);
      }

      return measurementTextarea;
    };

    const measure = (node: Element): number | undefined => {
      if (!(node instanceof HTMLTextAreaElement)) {
        return undefined;
      }

      const measurement = resolveMeasurementTextarea(node.ownerDocument);
      const measurementStyles = readComputedStyleProperties({
        node,
        propertyNames: TEXTAREA_MEASUREMENT_STYLE_PROPERTIES,
      });

      for (const [propertyName, value] of Object.entries(measurementStyles)) {
        if (appliedStyleValues.get(propertyName) !== value) {
          measurement.style.setProperty(propertyName, value);
          appliedStyleValues.set(propertyName, value);
        }
      }

      if (measurement.value !== node.value) {
        measurement.value = node.value;
      }

      if (measurement.rows !== node.rows) {
        measurement.rows = node.rows;
      }

      if (measurement.wrap !== node.wrap) {
        measurement.wrap = node.wrap;
      }

      if (measurement.placeholder !== node.placeholder) {
        measurement.placeholder = node.placeholder;
      }

      return measurement.scrollHeight;
    };

    const dispose = () => {
      measurementTextarea?.remove();
      measurementTextarea = null;
      appliedStyleValues.clear();
    };

    return { measure, dispose };
  };
