import { describe, expect, it } from 'vitest';

import { splitPlaybookMarks } from 'src/modules/opportunity/how-to-process/utils/split-playbook-marks';

describe('splitPlaybookMarks', () => {
  it('wraps skill triggers as GitHub-linked code tokens', () => {
    const marks = splitPlaybookMarks('Run /twenty-lead-brief locally.');
    const skillMark = marks.find((mark) => mark.kind === 'skill');

    expect(skillMark).toMatchObject({
      kind: 'skill',
      value: '/twenty-lead-brief',
    });
    if (skillMark?.kind === 'skill') {
      expect(skillMark.githubUrl).toContain(
        'src/skills/twenty-lead-brief/SKILL.md',
      );
    }
  });

  it('does not treat Applied as Apply', () => {
    const marks = splitPlaybookMarks('lands as Applied.', [
      { label: 'Apply', action: 'apply' },
    ]);

    expect(marks).toEqual([{ kind: 'text', value: 'lands as Applied.' }]);
  });

  it('links Open Briefs and My Applications labels', () => {
    const marks = splitPlaybookMarks(
      'See Open Briefs and My Applications.',
      [
        { label: 'Open Briefs', action: 'openBriefs' },
        { label: 'My Applications', action: 'myApplications' },
      ],
    );

    expect(marks.filter((mark) => mark.kind === 'link')).toEqual([
      {
        kind: 'link',
        value: 'Open Briefs',
        link: { label: 'Open Briefs', action: 'openBriefs' },
      },
      {
        kind: 'link',
        value: 'My Applications',
        link: { label: 'My Applications', action: 'myApplications' },
      },
    ]);
  });
});
