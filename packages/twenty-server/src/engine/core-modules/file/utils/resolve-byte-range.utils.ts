import { isDefined } from 'twenty-shared/utils';

import { type ResolvedByteRange } from 'src/engine/core-modules/file/types/resolved-byte-range.type';

// Single-range subset of RFC 9110 Range requests; malformed or multi-range
// headers fall back to a full response, which is always a valid answer.
const SINGLE_BYTE_RANGE_HEADER_PATTERN = /^bytes=(\d*)-(\d*)$/i;

export const resolveByteRange = ({
  rangeHeader,
  fileSizeInBytes,
}: {
  rangeHeader: string | undefined;
  fileSizeInBytes: number;
}): ResolvedByteRange => {
  if (!isDefined(rangeHeader)) {
    return { type: 'full' };
  }

  const rangeHeaderMatch = rangeHeader.match(SINGLE_BYTE_RANGE_HEADER_PATTERN);

  if (!isDefined(rangeHeaderMatch)) {
    return { type: 'full' };
  }

  const [, startPart, endPart] = rangeHeaderMatch;

  if (startPart === '' && endPart === '') {
    return { type: 'full' };
  }

  const lastByteIndex = fileSizeInBytes - 1;

  if (startPart === '') {
    const suffixLength = Number(endPart);

    if (suffixLength === 0 || fileSizeInBytes === 0) {
      return { type: 'unsatisfiable' };
    }

    return {
      type: 'partial',
      byteRange: {
        startByte: Math.max(fileSizeInBytes - suffixLength, 0),
        endByte: lastByteIndex,
      },
    };
  }

  const startByte = Number(startPart);

  if (startByte > lastByteIndex) {
    return { type: 'unsatisfiable' };
  }

  if (endPart === '') {
    return {
      type: 'partial',
      byteRange: { startByte, endByte: lastByteIndex },
    };
  }

  const requestedEndByte = Number(endPart);

  if (requestedEndByte < startByte) {
    return { type: 'full' };
  }

  return {
    type: 'partial',
    byteRange: {
      startByte,
      endByte: Math.min(requestedEndByte, lastByteIndex),
    },
  };
};
