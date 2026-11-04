// A Unicode noncharacter: Markdown decodes character references to it as U+FFFD, so message text cannot forge it.
export const PROTECTED_CHAT_REFERENCE_MARKER = '\uFDD0';
