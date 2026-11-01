import { isSnakeCaseToolName } from 'src/engine/core-modules/tool-provider/utils/is-snake-case-tool-name.util';

describe('isSnakeCaseToolName', () => {
  it.each([['delete_webhook'], ['list_webhooks'], ['find_many_v2']])(
    'should accept %p',
    (toolName) => {
      expect(isSnakeCaseToolName(toolName)).toBe(true);
    },
  );

  it.each([
    ['deleteWebhook'],
    ['Delete_webhook'],
    ['delete-webhook'],
    ['_delete_webhook'],
    ['2_delete_webhook'],
    [''],
  ])('should refuse %p', (toolName) => {
    expect(isSnakeCaseToolName(toolName)).toBe(false);
  });
});
