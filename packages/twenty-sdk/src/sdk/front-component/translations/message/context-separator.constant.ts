// Separates the disambiguation context from the source message inside a catalog
// key. A control character (U+0004) is used so it never clashes with real source
// strings, while keeping context-less keys equal to the raw message (backward
// compatible with the source-keyed catalogs the manifest pipeline already writes).
export const CONTEXT_SEPARATOR = String.fromCharCode(0x04);
