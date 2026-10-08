import { createLoadSkillTool } from 'src/engine/core-modules/tool-provider/tools/load-skill.tool';
import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

describe('createLoadSkillTool', () => {
  it('projects canonical skill documents to Markdown', async () => {
    const tool = createLoadSkillTool(
      async () => [
        {
          name: 'sales-playbook',
          label: 'Sales playbook',
          content: JSON.stringify({
            type: 'doc',
            attrs: { schemaVersion: 1 },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Qualify the account.' }],
              },
            ],
          }),
        } as FlatSkill,
      ],
      async () => [],
    );

    await expect(
      tool.execute({ skillNames: ['sales-playbook'] }),
    ).resolves.toMatchObject({
      skills: [
        {
          name: 'sales-playbook',
          label: 'Sales playbook',
          content: 'Qualify the account.',
        },
      ],
    });
  });
});
