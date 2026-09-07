const SKILL_GITHUB_BASE =
  'https://github.com/twentyhq/twenty/blob/main/packages/twenty-apps/internal/twenty-partners/src/skills';

export type PlaybookSkill = {
  name: string;
  trigger: string;
  githubUrl: string;
  outputs: readonly string[];
};

export const PLAYBOOK_SKILL_LEAD_BRIEF: PlaybookSkill = {
  name: 'twenty-lead-brief',
  trigger: '/twenty-lead-brief',
  githubUrl: `${SKILL_GITHUB_BASE}/twenty-lead-brief/SKILL.md`,
  outputs: [
    'A qualification summary in the conversation',
    'A partner brief — paste it into a Google Doc',
    'partner-match-criteria.md for the match step',
    'The Opportunity, with Design Doc URL set to that Doc',
  ],
};

export const PLAYBOOK_SKILL_SHORTLIST: PlaybookSkill = {
  name: 'twenty-partner-shortlist',
  trigger: '/twenty-partner-shortlist',
  githubUrl: `${SKILL_GITHUB_BASE}/twenty-partner-shortlist/SKILL.md`,
  outputs: [
    'A shortlist with a reason for each name',
    'partner-shortlist.md in the lead folder',
    'No CRM write — you review, then intro',
  ],
};

export const PLAYBOOK_SKILL_INTRO: PlaybookSkill = {
  name: 'twenty-partner-intro',
  trigger: '/twenty-partner-intro',
  githubUrl: `${SKILL_GITHUB_BASE}/twenty-partner-intro/SKILL.md`,
  outputs: [
    'Invited application rows for the names you picked',
    'Intro Sent At on the Opportunity',
    'Gmail drafts that carry the Design Doc URL',
  ],
};

export const PLAYBOOK_SKILLS: readonly PlaybookSkill[] = [
  PLAYBOOK_SKILL_LEAD_BRIEF,
  PLAYBOOK_SKILL_SHORTLIST,
  PLAYBOOK_SKILL_INTRO,
];
