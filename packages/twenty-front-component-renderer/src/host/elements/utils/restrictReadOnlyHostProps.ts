import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

const SAFE_STYLE_PROPERTIES = new Set([
  'alignContent',
  'alignItems',
  'alignSelf',
  'backgroundColor',
  'border',
  'borderBottom',
  'borderColor',
  'borderLeft',
  'borderRadius',
  'borderRight',
  'borderStyle',
  'borderTop',
  'borderWidth',
  'boxSizing',
  'color',
  'columnGap',
  'display',
  'flex',
  'flexBasis',
  'flexDirection',
  'flexGrow',
  'flexShrink',
  'flexWrap',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'gap',
  'gridTemplateColumns',
  'gridTemplateRows',
  'height',
  'justifyContent',
  'letterSpacing',
  'lineHeight',
  'margin',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'maxHeight',
  'maxWidth',
  'minHeight',
  'minWidth',
  'opacity',
  'order',
  'overflow',
  'overflowX',
  'overflowY',
  'padding',
  'paddingBottom',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'rowGap',
  'textAlign',
  'textDecoration',
  'textOverflow',
  'whiteSpace',
  'width',
  'wordBreak',
  'overflowWrap',
]);

const SAFE_PROPERTIES = new Set([
  'id',
  'className',
  'title',
  'role',
  'tabIndex',
  'hidden',
  'dir',
  'lang',
  'value',
  'defaultValue',
  'checked',
  'defaultChecked',
  'disabled',
  'readOnly',
  'placeholder',
  'name',
  'min',
  'max',
  'step',
  'maxLength',
  'minLength',
  'multiple',
  'selected',
  'required',
  'autoComplete',
  'inputMode',
  'type',
  'rows',
  'cols',
  'colSpan',
  'rowSpan',
  'scope',
  'viewBox',
  'width',
  'height',
  'd',
  'fill',
  'fillRule',
  'stroke',
  'strokeWidth',
  'strokeLinecap',
  'strokeLinejoin',
  'strokeDasharray',
  'strokeDashoffset',
  'clipRule',
  'opacity',
  'x',
  'y',
  'x1',
  'x2',
  'y1',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'points',
  'transform',
]);

export const restrictReadOnlyHostProps = (
  props: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [name, value] of Object.entries(props)) {
    if (name === 'style' && isPlainObject(value)) {
      result.style = Object.fromEntries(
        Object.entries(value).filter(
          ([property, styleValue]) =>
            SAFE_STYLE_PROPERTIES.has(property) &&
            !(isString(styleValue) && /url\s*\(|\\/i.test(styleValue)),
        ),
      );
    } else if (
      name.startsWith('aria-') ||
      name.startsWith('data-') ||
      (name.startsWith('on') && typeof value === 'function') ||
      SAFE_PROPERTIES.has(name)
    ) {
      if (
        (name === 'type' &&
          isString(value) &&
          value.toLowerCase() === 'file') ||
        ((name === 'fill' || name === 'stroke') &&
          isString(value) &&
          /url\s*\(|\\/i.test(value))
      ) {
        continue;
      }
      result[name] = value;
    }
  }

  return result;
};
