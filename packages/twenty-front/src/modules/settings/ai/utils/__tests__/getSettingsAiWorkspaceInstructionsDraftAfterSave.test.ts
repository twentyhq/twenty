import { getSettingsAiWorkspaceInstructionsDraftAfterSave } from '@/settings/ai/utils/getSettingsAiWorkspaceInstructionsDraftAfterSave';

describe('getSettingsAiWorkspaceInstructionsDraftAfterSave', () => {
  it('clears the draft confirmed by the save', () => {
    expect(
      getSettingsAiWorkspaceInstructionsDraftAfterSave({
        draft: { workspaceId: 'workspace-one', value: 'Use concise replies.' },
        workspaceId: 'workspace-one',
        savedInstructions: 'Use concise replies.',
      }),
    ).toBeNull();
  });

  it('keeps a newer draft edited while saving', () => {
    const draft = {
      workspaceId: 'workspace-one',
      value: 'Include clear next steps.',
    };

    expect(
      getSettingsAiWorkspaceInstructionsDraftAfterSave({
        draft,
        workspaceId: 'workspace-one',
        savedInstructions: 'Use concise replies.',
      }),
    ).toEqual(draft);
  });

  it('keeps the draft from another workspace', () => {
    const draft = {
      workspaceId: 'workspace-two',
      value: 'Use concise replies.',
    };

    expect(
      getSettingsAiWorkspaceInstructionsDraftAfterSave({
        draft,
        workspaceId: 'workspace-one',
        savedInstructions: 'Use concise replies.',
      }),
    ).toEqual(draft);
  });
});
