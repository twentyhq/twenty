import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { inventoryMemberFindingSchema } from '../schemas/inventoryMemberFindingSchema';
import { type inventoryReportSchema } from '../schemas/inventoryReportSchema';
import { inventorySandboxRuntimeSchema } from '../schemas/inventorySandboxRuntimeSchema';
import { inventoryTargetFindingSchema } from '../schemas/inventoryTargetFindingSchema';

type InventoryReport = z.infer<typeof inventoryReportSchema>;
type InventoryFinding = InventoryReport['findings'][number];

const TARGET_OBSERVATION_LABELS: Record<
  z.infer<typeof inventoryTargetFindingSchema>['observation'],
  string
> = {
  missing: 'Absent targets',
  uninspectable: 'Uninspectable targets',
};

const MEMBER_OBSERVATION_LABELS: Record<
  z.infer<typeof inventoryMemberFindingSchema>['observation'],
  string
> = {
  missing: 'Missing members',
  'shape-mismatch': 'Shape mismatch',
  'present-behavior-unverified': 'Present, unverified',
  uninspectable: 'Uninspectable members',
};

const EXAMPLE_MEMBER_IDS = [
  'window.requestAnimationFrame',
  'window.fetch',
  'globalThis.Element.prototype.closest',
  'globalThis.Clipboard.prototype.readText',
  'instance:rendered.div.closest',
];

const describeExampleMember = ({
  id,
  findings,
}: {
  id: string;
  findings: InventoryFinding[];
}) => {
  const memberFinding = findings.find((finding) => finding.id === id);
  if (!isUndefined(memberFinding)) {
    return `- ${id}: ${memberFinding.observation}`;
  }
  const [targetFinding] = findings
    .filter(
      (finding) =>
        finding.scope === 'target' && id.startsWith(`${finding.targetId}.`),
    )
    .sort((first, second) => second.targetId.length - first.targetId.length);
  return isUndefined(targetFinding)
    ? undefined
    : `- ${id}: ${targetFinding.observation} (target ${targetFinding.targetId})`;
};

export const summarizeInventoryReport = (report: InventoryReport): string => {
  const targetObservations =
    inventoryTargetFindingSchema.shape.observation.options;
  const memberObservations =
    inventoryMemberFindingSchema.shape.observation.options;
  const columnLabels = [
    ...targetObservations.map(
      (observation) => TARGET_OBSERVATION_LABELS[observation],
    ),
    ...memberObservations.map(
      (observation) => MEMBER_OBSERVATION_LABELS[observation],
    ),
    'Placement differences',
    'Descriptor differences',
  ];
  const referenceMemberCount = report.reference.targets.reduce(
    (count, target) => count + target.members.length,
    0,
  );
  const sharedFindingCount = report.findings.filter(
    (finding) =>
      finding.runtimes.length === inventorySandboxRuntimeSchema.options.length,
  ).length;
  const lines = [
    '# Renderer API inventory',
    '',
    `Complete collection. Chromium ${report.metadata.chromiumVersion}, Playwright ${report.metadata.playwrightVersion}, ${report.metadata.platform}/${report.metadata.architecture}.`,
    `${report.catalog.targets.length} reference targets; ${referenceMemberCount} reference members per runtime.`,
    `${report.findings.length} findings; ${sharedFindingCount} apply to every runtime. An unavailable target is one finding that groups its catalog members.`,
    'Every present API has unverified behavior. Differences are observations, without policy classification or a regression gate.',
    '',
    `| Runtime | ${columnLabels.join(' | ')} |`,
    `| --- | ${columnLabels.map(() => '---:').join(' | ')} |`,
  ];
  const details: string[] = [];
  for (const runtime of inventorySandboxRuntimeSchema.options) {
    const findings = report.findings.filter((finding) =>
      finding.runtimes.includes(runtime),
    );
    const targetFindings = findings.filter(
      (finding) => finding.scope === 'target',
    );
    const memberFindings = findings.filter(
      (finding) => finding.scope === 'member',
    );
    const counts = [
      ...targetObservations.map(
        (observation) =>
          targetFindings.filter(
            (finding) => finding.observation === observation,
          ).length,
      ),
      ...memberObservations.map(
        (observation) =>
          memberFindings.filter(
            (finding) => finding.observation === observation,
          ).length,
      ),
      memberFindings.filter((finding) => finding.isPlacementDifferent).length,
      memberFindings.filter((finding) => finding.isDescriptorDifferent).length,
    ];
    lines.push(`| ${runtime} | ${counts.join(' | ')} |`);
    const absentTargetFindings = targetFindings.filter(
      (finding) => finding.observation === 'missing',
    );
    const absentMemberCount = absentTargetFindings.reduce(
      (count, finding) => count + finding.memberCount,
      0,
    );
    details.push(
      '',
      `${runtime}: ${absentTargetFindings.length} absent targets group ${absentMemberCount} catalog members, listed per target in JSON.`,
      ...EXAMPLE_MEMBER_IDS.map((id) =>
        describeExampleMember({ id, findings }),
      ).filter((line) => !isUndefined(line)),
    );
  }
  lines.push(...details);
  lines.push(
    '',
    'Coverage limits:',
    ...report.reference.coverage.limits.map((limit) => `- ${limit}`),
    '',
    `Skipped or unexpanded reference entries: ${report.reference.coverage.skipped.length}. See JSON for individual reasons.`,
    '',
  );
  return lines.join('\n');
};
