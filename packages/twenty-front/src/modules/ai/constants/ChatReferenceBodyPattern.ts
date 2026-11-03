// No line breaks or unbalanced brackets, so an unclosed reference can't swallow the text after it; a name may hold one [..] pair.
export const CHAT_REFERENCE_BODY_PATTERN =
  '(?:[^\\[\\]\\n]|\\[[^\\[\\]\\n]*\\])*';
