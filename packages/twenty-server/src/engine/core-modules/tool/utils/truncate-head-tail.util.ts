import { formatBytes } from 'src/engine/core-modules/tool/utils/format-bytes.util';

type TruncateHeadTailArgs = {
  text: string;
  maxBytes: number;
  guidance: string;
};

const isUtf8ContinuationByte = (byte: number): boolean =>
  (byte & 0b11000000) === 0b10000000;

const isHighSurrogate = (code: number): boolean =>
  code >= 0xd800 && code <= 0xdbff;

const isLowSurrogate = (code: number): boolean =>
  code >= 0xdc00 && code <= 0xdfff;

const decodeHead = (text: string, budgetBytes: number): string => {
  if (budgetBytes <= 0) {
    return '';
  }

  let sliceEnd = Math.min(budgetBytes, text.length);

  // Keep surrogate pairs intact when the char budget lands mid-pair.
  if (
    sliceEnd < text.length &&
    isHighSurrogate(text.charCodeAt(sliceEnd - 1))
  ) {
    sliceEnd += 1;
  }

  const buffer = Buffer.from(text.slice(0, sliceEnd), 'utf-8');
  let end = Math.min(budgetBytes, buffer.length);

  while (
    end > 0 &&
    end < buffer.length &&
    isUtf8ContinuationByte(buffer[end])
  ) {
    end -= 1;
  }

  return buffer.subarray(0, end).toString('utf-8');
};

const decodeTail = (text: string, budgetBytes: number): string => {
  if (budgetBytes <= 0) {
    return '';
  }

  let sliceStart = Math.max(0, text.length - budgetBytes);

  if (sliceStart > 0 && isLowSurrogate(text.charCodeAt(sliceStart))) {
    sliceStart -= 1;
  }

  const buffer = Buffer.from(text.slice(sliceStart), 'utf-8');
  let start = Math.max(0, buffer.length - budgetBytes);

  while (start < buffer.length && isUtf8ContinuationByte(buffer[start])) {
    start += 1;
  }

  return buffer.subarray(start).toString('utf-8');
};

export const truncateHeadTail = ({
  text,
  maxBytes,
  guidance,
}: TruncateHeadTailArgs): string => {
  const totalBytes = Buffer.byteLength(text, 'utf-8');

  if (totalBytes <= maxBytes) {
    return text;
  }

  const marker = `\n[TRUNCATED: output was ${formatBytes(totalBytes)} (${totalBytes} bytes), above the ${formatBytes(maxBytes)} inline limit; middle omitted, showing head and tail. ${guidance}]\n`;
  const contentBudgetBytes = Math.max(0, maxBytes - Buffer.byteLength(marker));
  const headBudgetBytes = Math.ceil(contentBudgetBytes / 2);
  const tailBudgetBytes = contentBudgetBytes - headBudgetBytes;

  return `${decodeHead(text, headBudgetBytes)}${marker}${decodeTail(text, tailBudgetBytes)}`;
};
