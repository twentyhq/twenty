import { isCopyableFilesFieldSourcePath } from 'src/engine/core-modules/tool-provider/utils/is-copyable-files-field-source-path.util';

describe('isCopyableFilesFieldSourcePath', () => {
  it('should accept agent-chat uploads', () => {
    expect(isCopyableFilesFieldSourcePath('agent-chat/abc.pdf')).toBe(true);
  });

  it('should reject files from other folders', () => {
    expect(
      isCopyableFilesFieldSourcePath('files-field/field-uid/abc.pdf'),
    ).toBe(false);
    expect(isCopyableFilesFieldSourcePath('profile-picture/abc.png')).toBe(
      false,
    );
    expect(isCopyableFilesFieldSourcePath('agent-chat-x/abc.pdf')).toBe(false);
  });
});
