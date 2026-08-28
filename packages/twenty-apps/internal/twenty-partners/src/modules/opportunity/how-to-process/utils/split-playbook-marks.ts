import { PLAYBOOK_SKILLS } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { type PlaybookNavAction } from 'src/modules/opportunity/how-to-process/utils/playbook-nav';

export type PlaybookLink = {
  label: string;
  href?: string;
  action?: PlaybookNavAction;
};

export type PlaybookMark =
  | { kind: 'text'; value: string }
  | { kind: 'skill'; value: string; githubUrl: string }
  | { kind: 'link'; value: string; link: PlaybookLink };

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const splitPlaybookMarks = (
  text: string,
  links: ReadonlyArray<PlaybookLink> = [],
): PlaybookMark[] => {
  const terms = [
    ...PLAYBOOK_SKILLS.flatMap((skill) => [
      {
        kind: 'skill' as const,
        value: skill.trigger,
        githubUrl: skill.githubUrl,
      },
      {
        kind: 'skill' as const,
        value: skill.name,
        githubUrl: skill.githubUrl,
      },
    ]),
    ...links.map((link) => ({
      kind: 'link' as const,
      value: link.label,
      link,
    })),
  ].sort((left, right) => right.value.length - left.value.length);

  if (terms.length === 0) {
    return [{ kind: 'text', value: text }];
  }

  const pattern = new RegExp(
    `(${terms
      .map((term) => {
        const escaped = escapeRegExp(term.value);
        return term.kind === 'link' ? `\\b${escaped}\\b` : escaped;
      })
      .join('|')})`,
    'g',
  );

  const marks: PlaybookMark[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const matched = match[1];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      marks.push({ kind: 'text', value: text.slice(lastIndex, index) });
    }

    const term = terms.find((candidate) => candidate.value === matched);

    if (term?.kind === 'skill') {
      marks.push({
        kind: 'skill',
        value: matched,
        githubUrl: term.githubUrl,
      });
    } else if (term?.kind === 'link') {
      marks.push({ kind: 'link', value: matched, link: term.link });
    } else {
      marks.push({ kind: 'text', value: matched });
    }

    lastIndex = index + matched.length;
  }

  if (lastIndex < text.length) {
    marks.push({ kind: 'text', value: text.slice(lastIndex) });
  }

  return marks;
};
