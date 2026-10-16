import { PAUSING_TOOL_NAMES } from 'twenty-shared/ai';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';

describe('PAUSING_TOOLS', () => {
  it('pauses on exactly the tools the chat treats as waiting on the member', () => {
    expect(new Set(PAUSING_TOOLS.keys())).toEqual(PAUSING_TOOL_NAMES);
  });
});
