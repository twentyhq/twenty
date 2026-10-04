import { CoreObjectNameSingular } from 'twenty-shared/types';

import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';

const JANE_ID = '20202020-463f-435b-828c-107e007a2711';
const JONY_ID = '20202020-77d5-4cb6-b60a-f4a835a85d61';

const serializeParagraph = (
  content: ReturnType<typeof getMentionTagContent>,
) =>
  serializeJsonContentAsAdvancedTextEditorDocument({
    type: 'doc',
    content: [{ type: 'paragraph', content }],
  });

const mentionWorkspaceMember = ({
  recordId,
  label,
  shouldAddAsParticipant,
}: {
  recordId: string;
  label: string;
  shouldAddAsParticipant: boolean;
}) =>
  getMentionTagContent({
    recordId,
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    label,
    imageUrl: '',
    shouldAddAsParticipant,
  });

describe('getParticipantMentionsFromSerializedDocument', () => {
  it('returns each member mentioned to be added once', () => {
    const serializedDocument = serializeParagraph([
      ...mentionWorkspaceMember({
        recordId: JANE_ID,
        label: 'Jane Austen',
        shouldAddAsParticipant: true,
      }),
      ...mentionWorkspaceMember({
        recordId: JANE_ID,
        label: 'Jane Austen',
        shouldAddAsParticipant: true,
      }),
      ...mentionWorkspaceMember({
        recordId: JONY_ID,
        label: 'Jony Ive',
        shouldAddAsParticipant: true,
      }),
    ]);

    expect(
      getParticipantMentionsFromSerializedDocument(serializedDocument),
    ).toEqual([
      { workspaceMemberId: JANE_ID, label: 'Jane Austen' },
      { workspaceMemberId: JONY_ID, label: 'Jony Ive' },
    ]);
  });

  it('leaves out members whose addition was undone and record mentions', () => {
    const serializedDocument = serializeParagraph([
      ...mentionWorkspaceMember({
        recordId: JANE_ID,
        label: 'Jane Austen',
        shouldAddAsParticipant: false,
      }),
      ...getMentionTagContent({
        recordId: JONY_ID,
        objectNameSingular: CoreObjectNameSingular.Person,
        label: 'Jony Ive',
        imageUrl: '',
        shouldAddAsParticipant: true,
      }),
    ]);

    expect(
      getParticipantMentionsFromSerializedDocument(serializedDocument),
    ).toEqual([]);
  });

  it('returns nothing for an empty draft', () => {
    expect(getParticipantMentionsFromSerializedDocument('')).toEqual([]);
  });
});
