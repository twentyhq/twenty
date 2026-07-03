// Number of leading bytes read from a completed upload to detect its real
// content type. Magic-byte signatures live at the very start of a file, so a
// bounded prefix is enough to identify the type without ever buffering a
// large object into memory.
export const FILE_CONTENT_SNIFF_BYTE_COUNT = 64 * 1024;
