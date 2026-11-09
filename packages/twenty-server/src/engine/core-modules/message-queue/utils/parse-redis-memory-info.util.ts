import { isDefined } from 'twenty-shared/utils';

export type RedisMemoryInfo = {
  usedMemoryBytes: number;
  maxMemoryBytes: number;
};

const readInfoField = ({
  info,
  field,
}: {
  info: string;
  field: string;
}): number | undefined => {
  const match = info.match(new RegExp(`^${field}:(\\d+)\\s*$`, 'm'));

  return isDefined(match) ? Number(match[1]) : undefined;
};

export const parseRedisMemoryInfo = (
  info: string,
): RedisMemoryInfo | undefined => {
  const usedMemoryBytes = readInfoField({ info, field: 'used_memory' });
  const maxMemoryBytes = readInfoField({ info, field: 'maxmemory' });

  if (!isDefined(usedMemoryBytes) || !isDefined(maxMemoryBytes)) {
    return undefined;
  }

  return { usedMemoryBytes, maxMemoryBytes };
};
