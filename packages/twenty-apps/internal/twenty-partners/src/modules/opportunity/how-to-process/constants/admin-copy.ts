import { OPPORTUNITY_STAGE_OPTIONS } from 'src/modules/opportunity/constants/opportunity-stage-options';
import {
  PLAYBOOK_SKILL_INTRO,
  PLAYBOOK_SKILL_LEAD_BRIEF,
  PLAYBOOK_SKILL_SHORTLIST,
} from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { type PlaybookStep } from 'src/modules/opportunity/how-to-process/types/playbook-step.type';
import { type PlaybookLink } from 'src/modules/opportunity/how-to-process/utils/playbook-nav';

export const DISCORD_CHAT_URL =
  'https://discord.com/channels/1130383047699738754/1513506376595538032';

export const HOW_TO_PROCESS_KICKER = 'Playbook';
export const HOW_TO_PROCESS_TITLE = 'How to process';
export const HOW_TO_PROCESS_LEDE =
  'This is the path from a new deal to a winner. Each step says what you do, then what the app does.';

export const HOW_TO_PROCESS_BODY_LINKS: readonly PlaybookLink[] = [
  { label: 'Discord', href: DISCORD_CHAT_URL },
];

export const DEAL_BOARD_STAGE_LABELS = OPPORTUNITY_STAGE_OPTIONS.filter(
  (option) => option.value !== 'DONE' && option.value !== 'DEAD',
).map((option) => option.label);

const DEAL_STAGE_PATH = DEAL_BOARD_STAGE_LABELS.join(' → ');

export const HOW_TO_PROCESS_STEPS: PlaybookStep[] = [
  {
    num: '01',
    heading: 'Where the deal comes from',
    body: 'Three intakes. Treat each one differently.',
    bullets: [
      'Marketplace brief — already Listed. Discord gets a ping on submit. Do not list it again.',
      'Twenty Internal — not listed. You list it later.',
      'Sales call — /twenty-lead-brief writes the Opportunity and the Design Doc URL.',
    ],
  },
  {
    num: '02',
    heading: 'Prepare the brief',
    body: 'Fill Need, Requirements, and Design Doc URL from the skill output. Do not intro without the doc. Partner mail carries that link.',
    skills: [PLAYBOOK_SKILL_LEAD_BRIEF],
  },
  {
    num: '03',
    heading: 'List, or do not',
    body: 'Turn Listed on when partners may see the brief. Open Briefs then shows the row. Discord pings on that flip. A daily digest mails validated partners. Do not also mail the whole directory.',
    note: 'A marketplace brief is already Listed. Do not list twice.',
  },
  {
    num: '04',
    heading: 'Match',
    body: 'Briefs to Match is the queue with no Partner yet. You can do all of this through MCP. Ask the agent to make the changes in the CRM. Skills are also available: /twenty-partner-shortlist, or wait for applications. /twenty-lead-brief is available if the brief is still thin. /twenty-partner-intro is available once you name the partners.',
    pills: ['Applied — the partner came in', 'Invited — you pushed them'],
    skills: [PLAYBOOK_SKILL_SHORTLIST],
  },
  {
    num: '05',
    heading: 'Intro',
    body: 'After you name the partners, /twenty-partner-intro creates Invited rows and sets Intro Sent At. The app then turns Listed off. Turning Listed off removes the brief from Open Briefs, but applied and invited partners keep it in My Applications.',
    note: 'Do not send a second wave unless you mean to. Unlisting is not a way to hide the brief from the partners who already applied.',
    skills: [PLAYBOOK_SKILL_INTRO],
  },
  {
    num: '06',
    heading: 'Pick the winner',
    body: `Set Partner on the Opportunity. The winner Application goes to Won. The others go to Declined. Backup stays. Clear Partner and only Won returns to Applied. Move the deal on Deals: ${DEAL_STAGE_PATH}.`,
  },
];
