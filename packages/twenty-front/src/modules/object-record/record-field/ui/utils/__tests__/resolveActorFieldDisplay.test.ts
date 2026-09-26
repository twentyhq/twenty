import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { resolveActorFieldDisplay } from '@/object-record/record-field/ui/utils/resolveActorFieldDisplay';

const actor: FieldActorValue = {
  source: 'MANUAL',
  workspaceMemberId: 'workspace-member-id',
  name: 'Tim A',
  context: null,
};

describe('resolveActorFieldDisplay', () => {
  it('should use the current workspace member name', () => {
    expect(
      resolveActorFieldDisplay({
        fieldValue: actor,
        workspaceMembers: [
          {
            id: 'workspace-member-id',
            name: { firstName: 'Tim', lastName: 'Apple' },
            avatarUrl: 'avatar.png',
          },
        ],
      }),
    ).toEqual({ name: 'Tim Apple', avatarUrl: 'avatar.png' });
  });

  it('should fall back to the stored actor name', () => {
    expect(
      resolveActorFieldDisplay({ fieldValue: actor, workspaceMembers: [] }),
    ).toEqual({ name: 'Tim A' });
  });
});
