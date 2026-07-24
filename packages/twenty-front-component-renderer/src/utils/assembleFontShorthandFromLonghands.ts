import { isNonEmptyString } from '@sniptt/guards';

type AssembleFontShorthandFromLonghandsInput = {
  fontStyle: string | null | undefined;
  fontWeight: string | null | undefined;
  fontSize: string;
  lineHeight: string | null | undefined;
  fontFamily: string;
};

export const assembleFontShorthandFromLonghands = ({
  fontStyle,
  fontWeight,
  fontSize,
  lineHeight,
  fontFamily,
}: AssembleFontShorthandFromLonghandsInput): string => {
  const sizeAndLineHeight = isNonEmptyString(lineHeight)
    ? `${fontSize}/${lineHeight}`
    : fontSize;

  return [fontStyle, fontWeight, sizeAndLineHeight, fontFamily]
    .filter(isNonEmptyString)
    .join(' ');
};
