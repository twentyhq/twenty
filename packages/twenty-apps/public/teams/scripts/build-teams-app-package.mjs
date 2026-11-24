import { createWriteStream, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { finished } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import archiver from 'archiver';

const PROJECT_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIRECTORY = join(PROJECT_DIRECTORY, 'teams-app-package');
const OUTPUT_PATH = join(PROJECT_DIRECTORY, 'dist', 'teams-app-package.zip');
const BOT_APP_ID_PLACEHOLDER = '<TEAMS_BOT_APP_ID>';
const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ICON_FILE_NAMES = ['color.png', 'outline.png'];

const readBotAppIdOrExit = () => {
  const { values } = parseArgs({
    options: { 'bot-app-id': { type: 'string' } },
  });
  const botAppId = values['bot-app-id'] ?? process.env.TEAMS_BOT_APP_ID;

  if (botAppId === undefined || !GUID_PATTERN.test(botAppId)) {
    console.error(
      'Pass the Application (client) ID of the bot Entra app registration: yarn teams-app:package --bot-app-id <guid> (or set TEAMS_BOT_APP_ID).',
    );
    process.exit(1);
  }

  return botAppId.toLowerCase();
};

const botAppId = readBotAppIdOrExit();

const manifest = readFileSync(
  join(SOURCE_DIRECTORY, 'manifest.json'),
  'utf8',
).replaceAll(BOT_APP_ID_PLACEHOLDER, botAppId);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

const output = createWriteStream(OUTPUT_PATH);
const archive = archiver('zip');

archive.pipe(output);
archive.append(manifest, { name: 'manifest.json' });

for (const iconFileName of ICON_FILE_NAMES) {
  archive.file(join(SOURCE_DIRECTORY, iconFileName), { name: iconFileName });
}

await archive.finalize();
await finished(output);

console.log(`Wrote ${OUTPUT_PATH}`);
