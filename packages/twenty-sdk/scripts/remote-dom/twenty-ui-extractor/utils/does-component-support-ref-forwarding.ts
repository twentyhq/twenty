import { type ExportSpecifier } from 'ts-morph';

const REF_FORWARDING_TYPE_MARKERS = [
  'StyledComponent',
  'ForwardRefExoticComponent',
];

export const doesComponentSupportRefForwarding = (
  namedExport: ExportSpecifier,
): boolean => {
  const typeText = namedExport.getNameNode().getType().getText();

  return REF_FORWARDING_TYPE_MARKERS.some((marker) =>
    typeText.includes(marker),
  );
};
