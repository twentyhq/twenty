import { LINE_PUSH_LIMITS } from 'src/constants/line-push-limits.constant';

const isHighSurrogate = (codeUnit: number) =>
  codeUnit >= 0xd800 && codeUnit <= 0xdbff;

const findChunkEnd = (text: string, maxLength: number) => {
  for (const separator of ['\n', ' ']) {
    const separatorIndex = text.lastIndexOf(separator, maxLength);

    if (separatorIndex > 0) {
      return { end: separatorIndex, skip: 1 };
    }
  }

  const end = isHighSurrogate(text.charCodeAt(maxLength - 1))
    ? maxLength - 1
    : maxLength;

  return { end, skip: 0 };
};

export const splitOutgoingText = (
  text: string,
  maxLength: number = LINE_PUSH_LIMITS.textMaxLength,
): string[] => {
  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    const { end, skip } = findChunkEnd(remaining, maxLength);

    chunks.push(remaining.slice(0, end));
    remaining = remaining.slice(end + skip);
  }

  return [...chunks, remaining];
};
