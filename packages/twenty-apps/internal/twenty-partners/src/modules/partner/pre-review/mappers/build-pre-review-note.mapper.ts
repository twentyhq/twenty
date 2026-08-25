import { type PreReviewVerdict } from 'src/modules/partner/pre-review/constants/pre-review-verdict.constant';
import {
  type EvidencePack,
} from 'src/modules/partner/pre-review/types/pre-review.type';
import { type PreReviewAgentOutput } from 'src/modules/partner/pre-review/utils/parse-pre-review-agent-result.util';

const toDisplayVerdict = (verdict: PreReviewVerdict): string =>
  verdict.replace(/_/g, ' ');

const bulletList = (entries: string[], emptyText: string): string =>
  entries.length === 0
    ? emptyText
    : entries.map((entry) => `- ${entry}`).join('\n');

const dedupe = (entries: string[]): string[] => [...new Set(entries)];

export const buildPreReviewNote = ({
  verdict,
  agentOutput,
  evidencePack,
}: {
  verdict: PreReviewVerdict;
  agentOutput: PreReviewAgentOutput;
  evidencePack: EvidencePack;
}): { title: string; markdown: string } => {
  const capNotice =
    verdict === agentOutput.verdict
      ? []
      : [
          `> No proof could be verified automatically, so the verdict is capped at ${toDisplayVerdict(
            verdict,
          )} (the model proposed ${toDisplayVerdict(agentOutput.verdict)}).`,
          '',
        ];

  const markdown = [
    agentOutput.headline,
    '',
    ...capNotice,
    '## Evidence',
    '',
    bulletList(agentOutput.evidence, 'None recorded.'),
    '',
    '## Flags',
    '',
    bulletList(agentOutput.flags, 'None.'),
    '',
    '## Needs human look',
    '',
    bulletList(
      dedupe([...evidencePack.needsHumanLook, ...agentOutput.needsHumanLook]),
      'Nothing.',
    ),
    '',
    '---',
    '',
    'Videos are never watched — only their title, description and captions are read.',
  ].join('\n');

  return { title: `Pre-review — ${toDisplayVerdict(verdict)}`, markdown };
};
