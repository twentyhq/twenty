import { PROTECTED_CHAT_REFERENCE_MARKER } from '@/ai/constants/ProtectedChatReferenceMarker';
import { getProtectedChatReferenceSegments } from '@/ai/utils/getProtectedChatReferenceSegments';

const MIA_MENTION =
  '[[record:workspaceMember:20202020-0687-4c41-b707-ed1bfca972a7:Mia Lee]]';

describe('getProtectedChatReferenceSegments', () => {
  it('should only return the references that follow the marker', () => {
    expect(
      getProtectedChatReferenceSegments(
        `Ask ${PROTECTED_CHAT_REFERENCE_MARKER}${MIA_MENTION}, not ${MIA_MENTION}`,
      ),
    ).toEqual([
      'Ask ',
      {
        kind: 'record',
        objectNameSingular: 'workspaceMember',
        recordId: '20202020-0687-4c41-b707-ed1bfca972a7',
        displayName: 'Mia Lee',
        fullMatch: MIA_MENTION,
        index: 5,
      },
      ', not ',
      MIA_MENTION,
    ]);
  });

  it('should drop a marker that precedes no reference', () => {
    expect(
      getProtectedChatReferenceSegments(
        `Ask ${PROTECTED_CHAT_REFERENCE_MARKER}Mia`,
      ),
    ).toEqual(['Ask Mia']);
  });
});
