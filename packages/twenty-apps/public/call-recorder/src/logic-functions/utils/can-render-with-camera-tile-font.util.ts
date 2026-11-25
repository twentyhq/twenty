const SUPPORTED_SCRIPTS_PATTERN =
  /^[\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}\p{Script=Common}\p{Script=Inherited}]*$/u;
const EMOJI_PATTERN =
  /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{20E3}]/u;

export const canRenderWithCameraTileFont = (text: string): boolean =>
  SUPPORTED_SCRIPTS_PATTERN.test(text) && !EMOJI_PATTERN.test(text);
