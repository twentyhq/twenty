export const isFixedPositionStyle = (
  style: Pick<CSSStyleDeclaration, 'position'>,
): boolean => style.position === 'fixed';
