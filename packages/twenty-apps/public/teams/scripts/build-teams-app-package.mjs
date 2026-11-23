import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

const PROJECT_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIRECTORY = join(PROJECT_DIRECTORY, 'teams-app-package');
const OUTPUT_PATH = join(PROJECT_DIRECTORY, 'dist', 'teams-app-package.zip');
const BOT_APP_ID_PLACEHOLDER = '<TEAMS_BOT_APP_ID>';
const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ICON_FILE_NAMES = ['color.png', 'outline.png'];
const DEFLATE_METHOD = 8;
const UTF8_FILE_NAME_FLAG = 0x0800;

const buildZipArchive = (files) => {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const { name, content } of files) {
    const nameBuffer = Buffer.from(name, 'utf8');
    const compressed = deflateRawSync(content);

    const sharedHeader = Buffer.alloc(26);
    sharedHeader.writeUInt16LE(20, 0);
    sharedHeader.writeUInt16LE(UTF8_FILE_NAME_FLAG, 2);
    sharedHeader.writeUInt16LE(DEFLATE_METHOD, 4);
    sharedHeader.writeUInt32LE(crc32(content), 10);
    sharedHeader.writeUInt32LE(compressed.length, 14);
    sharedHeader.writeUInt32LE(content.length, 18);
    sharedHeader.writeUInt16LE(nameBuffer.length, 22);

    const localSignature = Buffer.alloc(4);
    localSignature.writeUInt32LE(0x04034b50, 0);

    const centralPrefix = Buffer.alloc(6);
    centralPrefix.writeUInt32LE(0x02014b50, 0);
    centralPrefix.writeUInt16LE(20, 4);

    const centralSuffix = Buffer.alloc(14);
    centralSuffix.writeUInt32LE(offset, 10);

    localParts.push(localSignature, sharedHeader, nameBuffer, compressed);
    centralParts.push(centralPrefix, sharedHeader, centralSuffix, nameBuffer);
    offset +=
      localSignature.length +
      sharedHeader.length +
      nameBuffer.length +
      compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);

  return Buffer.concat([...localParts, centralDirectory, endRecord]);
};

const readBotAppIdOrExit = () => {
  const argumentIndex = process.argv.indexOf('--bot-app-id');
  const botAppId =
    argumentIndex === -1
      ? process.env.TEAMS_BOT_APP_ID
      : process.argv[argumentIndex + 1];

  if (typeof botAppId !== 'string' || !GUID_PATTERN.test(botAppId)) {
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

const archive = buildZipArchive([
  { name: 'manifest.json', content: Buffer.from(manifest, 'utf8') },
  ...ICON_FILE_NAMES.map((name) => ({
    name,
    content: readFileSync(join(SOURCE_DIRECTORY, name)),
  })),
]);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, archive);

console.log(`Wrote ${OUTPUT_PATH}`);
