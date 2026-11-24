import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { TEAMS_ASSISTANT_HELP_REQUESTS } from 'src/features/chat/logic-functions/constants/teams-assistant-help-requests';

const PACKAGE_DIRECTORY = join(__dirname, '..', '..', 'teams-app-package');
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;

const manifest = JSON.parse(
  readFileSync(join(PACKAGE_DIRECTORY, 'manifest.json'), 'utf8'),
);

const readPngSize = (fileName: string) => {
  const png = readFileSync(join(PACKAGE_DIRECTORY, fileName));

  return {
    width: png.readUInt32BE(PNG_WIDTH_OFFSET),
    height: png.readUInt32BE(PNG_HEIGHT_OFFSET),
  };
};

describe('Teams app package manifest', () => {
  it('should stay within the Teams text limits', () => {
    expect(manifest.developer.name.length).toBeLessThanOrEqual(32);
    expect(manifest.name.short.length).toBeLessThanOrEqual(30);
    expect(manifest.name.full.length).toBeLessThanOrEqual(100);
    expect(manifest.description.short.length).toBeLessThanOrEqual(80);
    expect(manifest.description.full.length).toBeLessThanOrEqual(4000);
  });

  it('should only list commands the bot answers without the assistant', () => {
    const commandTitles = manifest.bots[0].commandLists.flatMap(
      (commandList: { commands: { title: string }[] }) =>
        commandList.commands.map((command) => command.title),
    );

    expect(commandTitles).not.toHaveLength(0);

    for (const commandTitle of commandTitles) {
      expect(TEAMS_ASSISTANT_HELP_REQUESTS.has(commandTitle)).toBe(true);
    }
  });

  it('should ship icons in the sizes Teams requires', () => {
    expect(readPngSize(manifest.icons.color)).toEqual({
      width: 192,
      height: 192,
    });
    expect(readPngSize(manifest.icons.outline)).toEqual({
      width: 32,
      height: 32,
    });
  });
});
