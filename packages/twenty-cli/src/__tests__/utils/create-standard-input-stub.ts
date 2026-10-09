import { Socket } from 'node:net';

import { isDefined } from 'twenty-shared/utils';

class StandardInputStub extends Socket {
  readonly fd = 0;
  isRaw = false;
  isTTY: boolean;

  constructor({
    content,
    isTerminal,
  }: {
    content?: string;
    isTerminal: boolean;
  }) {
    super();
    this.isTTY = isTerminal;

    if (isDefined(content)) {
      this.push(content);
    }

    this.push(null);
  }

  setRawMode() {
    return this;
  }
}

export const createStandardInputStub = ({
  content,
  isTerminal = false,
}: {
  content?: string;
  isTerminal?: boolean;
}) => new StandardInputStub({ content, isTerminal });
