// The bundled font covers Latin, Greek and Cyrillic, and the runtime has no
// fallback fonts, so other scripts and emoji would render as empty boxes.
const SUPPORTED_SCRIPTS_PATTERN =
  /^[\p{Script=Latin}\p{Script=Greek}\p{Script=Cyrillic}\p{Script=Common}\p{Script=Inherited}]*$/u;
const PICTOGRAPHIC_PATTERN = /\p{Extended_Pictographic}/u;

export const canRenderWithCameraTileFont = (text: string): boolean =>
  SUPPORTED_SCRIPTS_PATTERN.test(text) && !PICTOGRAPHIC_PATTERN.test(text);
