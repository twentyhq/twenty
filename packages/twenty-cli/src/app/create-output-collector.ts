export const createOutputCollector = (limitBytes: number) => {
  const collected = Buffer.alloc(limitBytes);
  let size = 0;
  let isTruncated = false;

  return {
    add: (chunk: Buffer) => {
      const copied = chunk.copy(collected, size, 0, limitBytes - size);

      size += copied;
      isTruncated ||= copied < chunk.length;
    },
    read: () => ({
      text: collected.toString('utf8', 0, size),
      isTruncated,
    }),
  };
};
