import { describe, expect, it } from 'vitest';

import { PLAYBOOK_SKILL_LEAD_BRIEF } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { splitPlaybookMarks } from 'src/modules/opportunity/how-to-process/utils/split-playbook-marks';

describe('splitPlaybookMarks', () => {
  it('wraps skill triggers as GitHub-linked code tokens with leftover text', () => {
    const marks = splitPlaybookMarks('Run /twenty-lead-brief locally.', {
      skills: [PLAYBOOK_SKILL_LEAD_BRIEF],
    });

    expect(marks).toEqual([
      { kind: 'text', value: 'Run ' },
      {
        kind: 'skill',
        value: '/twenty-lead-brief',
        githubUrl: PLAYBOOK_SKILL_LEAD_BRIEF.githubUrl,
      },
      { kind: 'text', value: ' locally.' },
    ]);
  });

  it('prefers the longer skill trigger over the skill name', () => {
    const marks = splitPlaybookMarks(
      'twenty-lead-brief vs /twenty-lead-brief',
      { skills: [PLAYBOOK_SKILL_LEAD_BRIEF] },
    );

    expect(marks).toEqual([
      {
        kind: 'skill',
        value: 'twenty-lead-brief',
        githubUrl: PLAYBOOK_SKILL_LEAD_BRIEF.githubUrl,
      },
      { kind: 'text', value: ' vs ' },
      {
        kind: 'skill',
        value: '/twenty-lead-brief',
        githubUrl: PLAYBOOK_SKILL_LEAD_BRIEF.githubUrl,
      },
    ]);
  });

  it('does not treat Applied as Apply', () => {
    const marks = splitPlaybookMarks('lands as Applied.', {
      links: [{ label: 'Apply', action: 'openBriefs' }],
    });

    expect(marks).toEqual([{ kind: 'text', value: 'lands as Applied.' }]);
  });

  it('links Open Briefs and My Applications labels', () => {
    const openBriefs = {
      label: 'Open Briefs',
      action: 'openBriefs' as const,
    };
    const myApplications = {
      label: 'My Applications',
      action: 'myApplications' as const,
    };

    const marks = splitPlaybookMarks('See Open Briefs and My Applications.', {
      links: [openBriefs, myApplications],
    });

    expect(marks).toEqual([
      { kind: 'text', value: 'See ' },
      { kind: 'link', value: 'Open Briefs', link: openBriefs },
      { kind: 'text', value: ' and ' },
      { kind: 'link', value: 'My Applications', link: myApplications },
      { kind: 'text', value: '.' },
    ]);
  });

  it('links href terms', () => {
    const discord = {
      label: 'Discord',
      href: 'https://discord.com/channels/1130383047699738754/1513506376595538032',
    };

    expect(
      splitPlaybookMarks('Ping Discord after list.', { links: [discord] }),
    ).toEqual([
      { kind: 'text', value: 'Ping ' },
      { kind: 'link', value: 'Discord', link: discord },
      { kind: 'text', value: ' after list.' },
    ]);
  });

  it('returns a single text mark when there are no terms or no matches', () => {
    expect(splitPlaybookMarks('')).toEqual([{ kind: 'text', value: '' }]);
    expect(splitPlaybookMarks('nothing to mark')).toEqual([
      { kind: 'text', value: 'nothing to mark' },
    ]);
    expect(
      splitPlaybookMarks('nothing to mark', {
        skills: [PLAYBOOK_SKILL_LEAD_BRIEF],
      }),
    ).toEqual([{ kind: 'text', value: 'nothing to mark' }]);
  });
});
