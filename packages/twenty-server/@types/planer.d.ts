declare module 'planer' {
  export function extractFrom(
    msgBody: string,
    contentType?: 'text/plain' | 'text/html',
    dom?: Document,
  ): string;

  export function extractFromPlain(msgBody: string): string;

  export function extractFromHtml(msgBody: string, dom?: Document): string;

  export function markMessageLines(lines: string[]): string;

  export function processMarkedLines(
    lines: string[],
    markers: string,
    returnFlags?: Record<string, unknown>,
  ): string[];
}
