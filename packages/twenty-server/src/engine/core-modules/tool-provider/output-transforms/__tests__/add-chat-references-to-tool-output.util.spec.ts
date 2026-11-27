import { parseChatReferences } from 'twenty-shared/ai';

import { addChatReferencesToToolOutput } from 'src/engine/core-modules/tool-provider/output-transforms/add-chat-references-to-tool-output.util';

describe('addChatReferencesToToolOutput', () => {
  it('should give each record reference a chat reference the chat renders', () => {
    const output = addChatReferencesToToolOutput({
      success: true,
      message: 'Found 1 person records',
      recordReferences: [
        {
          objectNameSingular: 'person',
          recordId: 'efd26a1d-6a5d-474c-a4de-a698bde7f0ae',
          displayName: 'Zoe Brennan',
        },
      ],
    });

    const chatReference = output.recordReferences?.[0]?.chatReference ?? '';

    expect(chatReference).toBe(
      '[[record:person:efd26a1d-6a5d-474c-a4de-a698bde7f0ae:Zoe Brennan]]',
    );
    expect(parseChatReferences(chatReference)).toHaveLength(1);
  });

  it('should keep the other record reference fields', () => {
    const output = addChatReferencesToToolOutput({
      success: true,
      message: 'Created task',
      recordReferences: [
        {
          objectNameSingular: 'task',
          recordId: '34821146-dff7-46b1-9465-a9e065b015c0',
          displayName: 'Send the article on market entry',
        },
      ],
    });

    expect(output.recordReferences?.[0]).toMatchObject({
      objectNameSingular: 'task',
      recordId: '34821146-dff7-46b1-9465-a9e065b015c0',
      displayName: 'Send the article on market entry',
    });
  });

  it('should return the output unchanged when there are no record references', () => {
    const output = { success: true, message: 'Done' };

    expect(addChatReferencesToToolOutput(output)).toBe(output);
  });
});
