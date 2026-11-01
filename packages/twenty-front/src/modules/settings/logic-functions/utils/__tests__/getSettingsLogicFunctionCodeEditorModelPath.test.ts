import { getSettingsLogicFunctionCodeEditorModelPath } from '@/settings/logic-functions/utils/getSettingsLogicFunctionCodeEditorModelPath';

describe('getSettingsLogicFunctionCodeEditorModelPath', () => {
  it('creates a file URI for a root filename', () => {
    expect(getSettingsLogicFunctionCodeEditorModelPath('index.ts')).toBe(
      'file:///index.ts',
    );
  });

  it('preserves nested directories in the model path', () => {
    expect(
      getSettingsLogicFunctionCodeEditorModelPath(
        'src/logic-functions/index.ts',
      ),
    ).toBe('file:///src/logic-functions/index.ts');
  });

  it('encodes spaces, hash characters, and question marks as filename content', () => {
    expect(
      getSettingsLogicFunctionCodeEditorModelPath('src/my file#draft?.ts'),
    ).toBe('file:///src/my%20file%23draft%3F.ts');
  });
});
