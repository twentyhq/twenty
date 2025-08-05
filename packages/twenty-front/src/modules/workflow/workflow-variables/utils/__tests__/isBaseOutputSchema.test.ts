import { isBaseOutputSchema } from '@/workflow/workflow-variables/utils/isBaseOutputSchema';

describe('isBaseOutputSchema', () => {
  // This looks weird, but that is the way this method was built
  it('should return false for base output schema', () => {
    expect(
      isBaseOutputSchema({ _outputSchemaType: 'LINK', link: { isLeaf: true } }),
    ).toBe(false);
  });

  it('should return true in other cases', () => {
    expect(isBaseOutputSchema({})).toBe(true);
  });
});
