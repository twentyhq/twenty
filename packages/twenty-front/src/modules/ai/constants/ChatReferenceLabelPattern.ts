// Excluding brackets and line breaks keeps an unclosed reference from swallowing
// the text that follows it, up to and including the next reference.
export const CHAT_REFERENCE_LABEL_PATTERN = '[^\\[\\]\\n]*';
