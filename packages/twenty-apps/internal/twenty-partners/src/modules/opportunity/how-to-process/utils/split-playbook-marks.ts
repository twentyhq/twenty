import { type PlaybookSkill } from 'src/modules/opportunity/how-to-process/constants/playbook-skills';
import { type PlaybookLink } from 'src/modules/opportunity/how-to-process/utils/playbook-nav';

export type PlaybookMark =
  | { kind: 'text'; value: string }
  | { kind: 'skill'; value: string; githubUrl: string }
  | { kind: 'link'; value: string; link: PlaybookLink };

type SplitPlaybookMarksOptions = {
  links?: ReadonlyArray<PlaybookLink>;
  skills?: ReadonlyArray<PlaybookSkill>;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const splitPlaybookMarks = (
  text: string,
  options: SplitPlaybookMarksOptions = {},
): PlaybookMark[] => {
  const links = options.links ?? [];
  const skills = options.skills ?? [];
  const terms = [
    ...skills.flatMap((skill) => [
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
