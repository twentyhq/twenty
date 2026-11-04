import { PROTECTED_CHAT_REFERENCE_MARKER } from '@/ai/constants/ProtectedChatReferenceMarker';
import { protectChatReferencesForMarkdown } from '@/ai/utils/protectChatReferencesForMarkdown';

const MARKER = PROTECTED_CHAT_REFERENCE_MARKER;
const MIA_MENTION =
  '[[record:workspaceMember:20202020-0687-4c41-b707-ed1bfca972a7:Mia Lee]]';
const ESCAPED_MIA_MENTION =
  '\\[\\[record:workspaceMember:20202020-0687-4c41-b707-ed1bfca972a7:Mia Lee\\]\\]';

describe('protectChatReferencesForMarkdown', () => {
  it('should leave plain text unchanged', () => {
    expect(
      protectChatReferencesForMarkdown('Which company should we contact?'),
    ).toBe('Which company should we contact?');
  });

  it('should mark a reference with a plain label', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Contact [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toBe(
      `Contact ${MARKER}[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next`,
    );
  });

  it('should add the record prefix to a reference written without it', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Contact [[company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next',
      ),
    ).toBe(
      `Contact ${MARKER}[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme]] next`,
    );
  });

  it('should escape backticks in labels', () => {
    expect(
      protectChatReferencesForMarkdown(
        'See [[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow `UPDATE_RECORD` step]]',
      ),
    ).toBe(
      `See ${MARKER}[[record:workflow:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Workflow \\\`UPDATE\\_RECORD\\\` step]]`,
    );
  });

  it('should leave colons in labels unchanged', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Ping [[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]',
      ),
    ).toBe(
      `Ping ${MARKER}[[record:person:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Doe: Jane]]`,
    );
  });

  it('should escape an object label without touching its name', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Open [[object:partner:Partners (EMEA)]]',
      ),
    ).toBe(`Open ${MARKER}[[object:partner:Partners \\(EMEA\\)]]`);
  });

  it('should escape a field label without touching its names', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[field:opportunity:nextStep:Next step (owner)]] field',
      ),
    ).toBe(
      `The ${MARKER}[[field:opportunity:nextStep:Next step \\(owner\\)]] field`,
    );
  });

  it('should escape a view label without touching its id', () => {
    expect(
      protectChatReferencesForMarkdown(
        'See [[view:44444444-4444-4444-4444-444444444444:Q1 - pipeline]]',
      ),
    ).toBe(
      `See ${MARKER}[[view:44444444-4444-4444-4444-444444444444:Q1 \\- pipeline]]`,
    );
  });

  it('should escape brackets in a label', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Open [[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:[test] name]]',
      ),
    ).toBe(
      `Open ${MARKER}[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:\\[test\\] name]]`,
    );
  });

  it('should leave a marker using a retired closing tag unchanged', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[field:opportunity:stage:Stage[[/field]] field',
      ),
    ).toBe('The [[field:opportunity:stage:Stage[[/field]] field');
  });

  it('should keep a surplus bracket added after a reference', () => {
    expect(
      protectChatReferencesForMarkdown(
        'Created [[object:opportunity:Opportunities]]].',
      ),
    ).toBe(`Created ${MARKER}[[object:opportunity:Opportunities]]].`);
  });

  it('should mark proposed field references', () => {
    expect(
      protectChatReferencesForMarkdown(
        'add [[field:person:role:Role]] and [[field:person:leadSource:Lead source]]',
      ),
    ).toBe(
      `add ${MARKER}[[field:person:role:Role]] and ${MARKER}[[field:person:leadSource:Lead source]]`,
    );
  });

  it('should keep only the display name when the text is a single malformed marker', () => {
    expect(
      protectChatReferencesForMarkdown(
        '[[field:person:lead source:Lead source]]',
      ),
    ).toBe('Lead source');
  });

  it('should keep only the display name of a marker matching no reference form', () => {
    expect(
      protectChatReferencesForMarkdown(
        '[[object:person:People]] gets [[field:person:lead source:Lead source]] and [[field:person:stage:Stage]]',
      ),
    ).toBe(
      `${MARKER}[[object:person:People]] gets Lead source and ${MARKER}[[field:person:stage:Stage]]`,
    );
  });

  it('should rewrite every kind in a mixed string', () => {
    expect(
      protectChatReferencesForMarkdown(
        'The [[view:44444444-4444-4444-4444-444444444444:Pipeline]] view of [[object:partner:Partners]] groups [[person:11111111-1111-1111-1111-111111111111:Alice]] by [[field:person:stage:Stage]]',
      ),
    ).toBe(
      `The ${MARKER}[[view:44444444-4444-4444-4444-444444444444:Pipeline]] view of ${MARKER}[[object:partner:Partners]] groups ${MARKER}[[record:person:11111111-1111-1111-1111-111111111111:Alice]] by ${MARKER}[[field:person:stage:Stage]]`,
    );
  });

  it.each([
    ['a list item', `- ${MIA_MENTION} owns the follow-up`],
    ['a table cell', `| Owner |\n| --- |\n| ${MIA_MENTION} |`],
    ['a heading', `## For ${MIA_MENTION}`],
    ['a blockquote', `> ${MIA_MENTION} said yes`],
    ['emphasis', `**${MIA_MENTION}**, please review`],
    ['a link label', `[Ask ${MIA_MENTION}](https://example.com)`],
    ['text after an escaped backslash', `C:\\\\${MIA_MENTION}`],
  ])('should mark a reference in %s', (_, text) => {
    expect(protectChatReferencesForMarkdown(text)).toBe(
      text.replace(MIA_MENTION, `${MARKER}${MIA_MENTION}`),
    );
  });

  it.each([
    [
      'inline code',
      'Write `[[record:company:a1b2c3d4-e5f6-7890-abcd-ef1234567890:Acme (EMEA)]]` to link it',
    ],
    ['a fenced code block', `\`\`\`\n${MIA_MENTION}\n\`\`\``],
    ['an indented code block', `    ${MIA_MENTION}`],
    [
      'a fenced code block in a list item',
      `- Example:\n\n  \`\`\`\n  ${MIA_MENTION}\n  \`\`\``,
    ],
    [
      'inline code in a table cell',
      `| Syntax |\n| --- |\n| \`${MIA_MENTION}\` |`,
    ],
    ['an HTML tag', `<span title="${MIA_MENTION}">Mia</span>`],
    ['escaped brackets', `Type ${ESCAPED_MIA_MENTION} to mention`],
    ['an escaped opening bracket', `Type \\${MIA_MENTION} to mention`],
    [
      'an escaped closing bracket',
      `Type ${MIA_MENTION.slice(0, -2)}\\]] to mention`,
    ],
  ])('should leave a reference in %s unchanged', (_, text) => {
    expect(protectChatReferencesForMarkdown(text)).toBe(text);
  });

  it('should mark only the occurrence outside code when a reference repeats', () => {
    expect(
      protectChatReferencesForMarkdown(
        `Write \`${MIA_MENTION}\` to ping ${MIA_MENTION}`,
      ),
    ).toBe(`Write \`${MIA_MENTION}\` to ping ${MARKER}${MIA_MENTION}`);
  });

  it('should drop markers already in the text', () => {
    expect(
      protectChatReferencesForMarkdown(`Type ${MARKER}${ESCAPED_MIA_MENTION}`),
    ).toBe(`Type ${ESCAPED_MIA_MENTION}`);
  });
});
