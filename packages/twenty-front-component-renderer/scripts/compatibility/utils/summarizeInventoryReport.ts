import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryReportSchema } from '../schemas/inventoryReportSchema';

export const summarizeInventoryReport = (
  report: z.infer<typeof inventoryReportSchema>,
): string => {
  const lines = [
    '# Renderer API inventory',
    '',
    `Complete collection. Chromium ${report.metadata.chromiumVersion}, Playwright ${report.metadata.playwrightVersion}, ${report.metadata.platform}/${report.metadata.architecture}.`,
    `${report.catalog.targets.length} reference targets; ${report.reference.targets.reduce((count, target) => count + target.members.length, 0)} reference members per runtime.`,
    'Every present API has unverified behavior. Differences are observations, without policy classification or a regression gate.',
    '',
    '| Runtime | Missing | Shape mismatch | Present, unverified | Uninspectable | Placement differences | Descriptor differences |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  const details: string[] = [];
  for (const runtime of ['react', 'preact'] as const) {
    const findings = report.findings.filter(
      (finding) => finding.runtime === runtime,
    );
    const counts = [
      'missing',
      'shape-mismatch',
      'present-behavior-unverified',
      'uninspectable',
    ].map(
      (status) =>
        findings.filter((finding) => finding.observation === status).length,
    );
    lines.push(
      `| ${runtime} | ${counts.join(' | ')} | ${findings.filter((finding) => finding.placementDiffers).length} | ${findings.filter((finding) => finding.descriptorDiffers).length} |`,
    );
    const missingTargets = report.sandboxes[runtime].targets.filter(
      (target) => target.status === 'missing',
    );
    details.push('');
    details.push(
      `${runtime}: ${missingTargets.length} absent targets (affected members remain grouped by target in JSON).`,
    );
    const examples = [
      'window.requestAnimationFrame',
      'window.fetch',
      'globalThis.Element.prototype.closest',
      'window.Clipboard.prototype.readText',
      'instance:rendered.div.closest',
    ]
      .map((id) => findings.find((finding) => finding.id === id))
      .filter((finding) => !isUndefined(finding));
    details.push(
      ...examples.map((finding) => `- ${finding.id}: ${finding.observation}`),
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
