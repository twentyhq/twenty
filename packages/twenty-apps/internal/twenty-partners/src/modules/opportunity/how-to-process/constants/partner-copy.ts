import { MIN_PITCH_LENGTH } from 'src/modules/application/apply/constants/apply-to-brief.constants';
import { type PlaybookStep } from 'src/modules/opportunity/how-to-process/types/playbook-step.type';
import { type PlaybookLink } from 'src/modules/opportunity/how-to-process/utils/playbook-nav';

export const HOW_TO_APPLY_KICKER = 'Playbook';
export const HOW_TO_APPLY_TITLE = 'How to apply';
export const HOW_TO_APPLY_LEDE =
  'Open Briefs is the live marketplace. Apply is pinned at the top of each brief. Twenty picks the winner.';

export const HOW_TO_APPLY_HEADER_LINKS: readonly PlaybookLink[] = [
  { label: 'Open Briefs', action: 'openBriefs' },
  { label: 'My Applications', action: 'myApplications' },
];

export const HOW_TO_APPLY_BODY_LINKS = HOW_TO_APPLY_HEADER_LINKS;

export const HOW_TO_APPLY_STEPS: PlaybookStep[] = [
  {
    num: '01',
    heading: 'Open Briefs',
    body: 'Open Briefs is the live marketplace. A row is here only when Twenty has listed the brief. If it is gone, the brief is closed or already in intro.',
  },
  {
    num: '02',
    heading: 'Apply',
    body: `Open the brief. Use Apply at the top of the record. Write a pitch of at least ${MIN_PITCH_LENGTH} characters. The pitch is set once. You cannot edit it later. One application per brief. A second apply is rejected.`,
    note: 'If Twenty already invited you, Apply fills the pitch on that row. The state stays Invited or Backup. Introduced, Won, and Declined cannot take a pitch.',
  },
  {
    num: '03',
    heading: 'What happens next',
    body: 'Your row lands in My Applications as Applied. Twenty may also invite you. Then the row is Invited. After an intro, wait for Twenty. Do not chase the client unless Twenty asks. Won or Declined is set when Twenty picks the Partner. You do not set those yourself.',
    note: 'A listed brief can still have a decided row. Listing and the winner field are not the same thing. My Applications still shows the brief after it leaves Open Briefs.',
  },
];
