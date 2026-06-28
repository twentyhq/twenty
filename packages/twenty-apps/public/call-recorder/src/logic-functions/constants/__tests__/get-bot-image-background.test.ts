import { afterEach, describe, expect, it } from 'vitest';

import { CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-bot-image-background-env-var-name';
import { DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND } from 'src/logic-functions/constants/default-call-recorder-bot-image-background';
import { getBotImageBackground } from 'src/logic-functions/constants/get-bot-image-background';

const ORIGINAL_VALUE =
  process.env[CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME];

const restore = () => {
  if (ORIGINAL_VALUE === undefined) {
    delete process.env[CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME];

    return;
  }

  process.env[CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME] = ORIGINAL_VALUE;
};

describe('getBotImageBackground', () => {
  afterEach(() => {
    restore();
  });

  it('returns the default when unset', () => {
    delete process.env[CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME];

    expect(getBotImageBackground()).toBe(
      DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND,
    );
  });

  it.each(['#000', '#000000', '#1B1B1B'])(
    'accepts valid hex color %s',
    (color) => {
      process.env[CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME] = color;

      expect(getBotImageBackground()).toBe(color);
    },
  );

  it.each(['white', '000000', '#xyzxyz', '#12345'])(
    'falls back to the default for invalid value %s',
    (value) => {
      process.env[CALL_RECORDER_BOT_IMAGE_BACKGROUND_ENV_VAR_NAME] = value;

      expect(getBotImageBackground()).toBe(
        DEFAULT_CALL_RECORDER_BOT_IMAGE_BACKGROUND,
      );
    },
  );
});
