import { OPPORTUNITY_STAGE_OPTIONS } from 'src/modules/opportunity/constants/opportunity-stage-options';

export type PlaybookStep = {
  num: string;
  heading: string;
  body: string;
  bullets?: string[];
  pills?: string[];
  note?: string;
  variant: 'step' | 'lastStep' | 'trust';
};

export const HOW_TO_PROCESS_KICKER = 'Playbook';
export const HOW_TO_PROCESS_TITLE = 'How to process';
export const HOW_TO_PROCESS_LEDE =
  'This is the path from a new deal to a winner. Each step says what you do, then what the app does.';

export const DEAL_BOARD_STAGE_LABELS = OPPORTUNITY_STAGE_OPTIONS.filter(
  (option) => option.position < 5,
).map((option) => option.label);

const DEAL_STAGE_PATH = DEAL_BOARD_STAGE_LABELS.join(' → ');

export const HOW_TO_PROCESS_STEPS: PlaybookStep[] = [
  {
    num: '01',
    heading: 'Where the deal comes from',
    variant: 'step',
    body: 'Three intakes. Treat each one differently.',
    bullets: [
      'Marketplace brief — already Listed. Discord gets a ping on submit. Do not list it again.',
      'TFT — not listed. You list it later.',
      'Sales call — /twenty-lead-brief writes the Opportunity and the Design Doc URL.',
    ],
  },
  {
    num: '02',
    heading: 'Prepare the brief',
    variant: 'step',
    body: 'Fill Need, Requirements, and Design Doc URL. Do not intro without the doc. Partner mail carries that link.',
  },
  {
    num: '03',
    heading: 'List, or do not',
    variant: 'step',
    body: 'Turn Listed on when partners may see the brief. Open Briefs then shows the row. Discord pings on that flip. A daily digest mails validated partners. Do not also mail the whole directory.',
    note: 'A marketplace brief is already Listed. Do not list twice.',
  },
  {
    num: '04',
    heading: 'Match',
    variant: 'step',
    body: 'Briefs to Match is the queue with no Partner yet. Use /twenty-partner-shortlist, or wait for applications.',
    pills: [
      'Applied — the partner came in',
      'Invited — you pushed them',
    ],
  },
  {
    num: '05',
    heading: 'Intro',
    variant: 'step',
    body: 'Use /twenty-partner-intro after you name the partners. That creates Invited rows and sets Intro Sent At. The app then turns Listed off.',
    note: 'Do not send a second wave unless you mean to.',
  },
  {
    num: '06',
    heading: 'Pick the winner',
    variant: 'lastStep',
    body: `Set Partner on the Opportunity. The winner Application goes to Won. The others go to Declined. Backup stays. Clear Partner and only Won returns to Applied. Move the deal on Deals: ${DEAL_STAGE_PATH}.`,
  },
];
