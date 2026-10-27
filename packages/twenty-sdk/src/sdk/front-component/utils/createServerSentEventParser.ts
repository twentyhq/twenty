export type ServerSentEvent = {
  id: string | null;
  event: string;
  data: string;
};

export const createServerSentEventParser = (
  onEvent: (serverSentEvent: ServerSentEvent) => void,
) => {
  let buffer = '';

  const dispatchBlock = (block: string) => {
    let id: string | null = null;
    let event = 'message';
    const dataLines: string[] = [];

    for (const line of block.split('\n')) {
      if (line.length === 0 || line.startsWith(':')) {
        continue;
      }

      const separatorIndex = line.indexOf(':');
      const field =
        separatorIndex === -1 ? line : line.slice(0, separatorIndex);
      const value =
        separatorIndex === -1
          ? ''
          : line.slice(separatorIndex + 1).replace(/^ /, '');

      if (field === 'id') {
        id = value;
      } else if (field === 'event') {
        event = value;
      } else if (field === 'data') {
        dataLines.push(value);
      }
    }

    if (dataLines.length > 0) {
      onEvent({ id, event, data: dataLines.join('\n') });
    }
  };

  return (chunk: string) => {
    buffer += chunk.replace(/\r\n?/g, '\n');

    let blockEndIndex = buffer.indexOf('\n\n');

    while (blockEndIndex !== -1) {
      dispatchBlock(buffer.slice(0, blockEndIndex));
      buffer = buffer.slice(blockEndIndex + 2);
      blockEndIndex = buffer.indexOf('\n\n');
    }
  };
};
