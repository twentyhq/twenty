#!/usr/bin/env node
// Dependency-free Node 24 canonical JSON serialization for deterministic output.
// RFC 8785-inspired: sorted object keys, no trailing whitespace, trailing newline.

/**
 * @param {unknown} value
 * @returns {string}
 */
export function stringifyCanonicalJson(value) {
  return canonicalize(value) + '\n';
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function canonicalize(value) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new Error('canonical-json: non-finite number');
    return String(value);
  }
  if (typeof value === 'string') return jsonStringify(value);
  if (Array.isArray(value)) {
    return '[' + value.map(canonicalize).join(',') + ']';
  }
  if (typeof value === 'object') {
    const entries = Object.keys(/** @type {Record<string, unknown>} */ (value))
      .sort()
      .map(
        (k) =>
          jsonStringify(k) +
          ':' +
          canonicalize(/** @type {Record<string, unknown>} */ (value)[k]),
      );
    return '{' + entries.join(',') + '}';
  }
  throw new Error('canonical-json: unsupported type ' + typeof value);
}

/**
 * @param {string} s
 * @returns {string}
 */
function jsonStringify(s) {
  let out = '"';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code === 0x22) out += '\\"';
    else if (code === 0x5c) out += '\\\\';
    else if (code === 0x08) out += '\\b';
    else if (code === 0x0c) out += '\\f';
    else if (code === 0x0a) out += '\\n';
    else if (code === 0x0d) out += '\\r';
    else if (code === 0x09) out += '\\t';
    else if (code < 0x20) out += '\\u' + code.toString(16).padStart(4, '0');
    else out += s[i];
  }
  return out + '"';
}
