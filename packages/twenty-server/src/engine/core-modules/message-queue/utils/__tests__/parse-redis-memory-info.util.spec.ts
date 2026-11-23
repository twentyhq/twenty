import { parseRedisMemoryInfo } from 'src/engine/core-modules/message-queue/utils/parse-redis-memory-info.util';

describe('parseRedisMemoryInfo', () => {
  it('reads used_memory and maxmemory', () => {
    expect(
      parseRedisMemoryInfo(
        '# Memory\r\nused_memory:1024\r\nused_memory_human:1.00K\r\nmaxmemory:4096\r\nmaxmemory_human:4.00K\r\n',
      ),
    ).toEqual({ usedMemoryBytes: 1024, maxMemoryBytes: 4096 });
  });

  it('returns undefined when a field is missing', () => {
    expect(parseRedisMemoryInfo('# Memory\r\nused_memory:1024\r\n')).toBe(
      undefined,
    );
  });
});
