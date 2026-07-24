const UNITLESS_CSS_PROPERTY_BASE_NAMES = [
  'animationIterationCount',
  'aspectRatio',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
];

const UNITLESS_CSS_PROPERTY_VENDOR_PREFIXES = ['Webkit', 'Moz', 'ms', 'O'];

const withVendorPrefixedAliases = (propertyName: string): string[] => [
  propertyName,
  ...UNITLESS_CSS_PROPERTY_VENDOR_PREFIXES.map(
    (vendorPrefix) =>
      `${vendorPrefix}${propertyName[0].toUpperCase()}${propertyName.slice(1)}`,
  ),
];

export const UNITLESS_CSS_PROPERTY_NAMES = new Set(
  UNITLESS_CSS_PROPERTY_BASE_NAMES.flatMap(withVendorPrefixedAliases),
);
