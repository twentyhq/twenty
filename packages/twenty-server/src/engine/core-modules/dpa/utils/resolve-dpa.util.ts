import {
  TWENTY_PRESIGNED_SIGNATORY,
  getDpaRegionConfig,
} from 'src/engine/core-modules/dpa/config/dpa-region-config.constant';
import { DPA_TEMPLATE_BLOCKS } from 'src/engine/core-modules/dpa/constants/dpa-template.constant';
import {
  DPA_DOCUMENT_TITLE,
  DPA_LAST_UPDATED_LABEL,
  DPA_TEMPLATE_VERSION,
} from 'src/engine/core-modules/dpa/constants/dpa-template-version.constant';
import subprocessorsData from 'src/engine/core-modules/dpa/constants/subprocessors.json';
import {
  type DpaResolveContext,
  type ResolvedDpa,
  type ResolvedDpaBlock,
} from 'src/engine/core-modules/dpa/types/dpa.types';
import { type SubprocessorList } from 'src/engine/core-modules/dpa/types/subprocessor.type';

const MERGE_FIELD_PATTERN = /\{\{([A-Z_]+)\}\}/g;

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  DE: 'Germany',
  FR: 'France',
};

const formatLocations = (codes: string[]): string =>
  codes.map((code) => COUNTRY_NAMES[code] ?? code).join(', ');

const SUBPROCESSOR_BLOCKS: ResolvedDpaBlock[] = (
  subprocessorsData as SubprocessorList
).subprocessors.map((subprocessor) => ({
  kind: 'paragraph',
  text: `${subprocessor.name}${subprocessor.vendorUrl ? ` (${subprocessor.vendorUrl})` : ''} — Processing location(s): ${formatLocations(subprocessor.processingLocations)}. ${subprocessor.services.join(' ')}`,
}));

// Shown on self-hosted deployments, where Twenty does not host or process
// Customer Personal Data and is therefore not the Processor — so this document
// is not an executed agreement with Twenty.
const SELF_HOSTED_NOTICE =
  'NOT A VALID AGREEMENT — SELF-HOSTED DEPLOYMENT. This Twenty instance is self-hosted. For self-hosted deployments Twenty does not host or process Customer Personal Data and is not the Processor, so this Data Processing Agreement does not apply. This copy is generated for reference only and does not constitute an executed agreement with Twenty.';

// Substitute every {{MERGE_FIELD}} with its resolved value. Unknown fields are
// left untouched so they surface in the "no unresolved {{ }}" test rather than
// silently disappearing.
const fillMergeFields = (
  text: string,
  values: Record<string, string>,
): string =>
  text.replace(MERGE_FIELD_PATTERN, (match, fieldName: string) =>
    fieldName in values ? values[fieldName] : match,
  );

// Build the execution / signature section. This is NOT part of the verbatim
// agreement text — it is the execution block where Twenty is pre-signed and the
// customer's entered legal entity + signatory are stamped, alongside the
// template version and execution date for provability.
const buildExecutionBlocks = (
  context: DpaResolveContext,
  values: Record<string, string>,
): ResolvedDpaBlock[] => {
  const blocks: ResolvedDpaBlock[] = [
    { kind: 'heading', text: 'Execution' },
    {
      kind: 'paragraph',
      text: `This Data Processing Agreement is executed by the parties as set out below. Acceptance constitutes execution of this DPA (and, where applicable, the Standard Contractual Clauses incorporated by reference) as of the Execution Date, in accordance with Section 13.6.`,
    },
    {
      kind: 'signatureField',
      text: '',
      label: `Processor — ${values.PROCESSOR_ENTITY}`,
      value: `Signed on behalf of ${values.PROCESSOR_ENTITY} (pre-signed by Twenty)\nName: ${TWENTY_PRESIGNED_SIGNATORY.name}\nTitle: ${TWENTY_PRESIGNED_SIGNATORY.title}`,
    },
    {
      kind: 'signatureField',
      text: '',
      label: 'Customer (Controller)',
      value: `Legal entity: ${context.customerLegalEntityName ?? ''}\nName: ${context.signatory?.name ?? ''}\nTitle: ${context.signatory?.title ?? ''}`,
    },
    {
      kind: 'signatureField',
      text: '',
      label: 'Execution Date',
      value: context.executedAt ?? '',
    },
    {
      kind: 'signatureField',
      text: '',
      label: 'DPA template version',
      value: `${DPA_TEMPLATE_VERSION} (Last Updated: ${DPA_LAST_UPDATED_LABEL})`,
    },
  ];

  return blocks;
};

// Pure resolver: (region, customer inputs) → fully resolved DPA. No I/O, no
// clock access — everything time-dependent is passed in via context.
export const resolveDpa = (context: DpaResolveContext): ResolvedDpa => {
  const config = getDpaRegionConfig(context.region);

  const bodyBlocks: ResolvedDpaBlock[] = DPA_TEMPLATE_BLOCKS.filter(
    (block) =>
      // No includeWhen → always present (this is how SCC sections 7.2–7.5 stay
      // in the document for every region). With includeWhen → toggled by region.
      block.includeWhen === undefined ||
      (block.includeWhen === 'sccSectionActive' && config.sccSectionActive),
  ).flatMap((block) =>
    block.expand === 'subprocessorList'
      ? SUBPROCESSOR_BLOCKS
      : [
          {
            kind: block.kind,
            text: fillMergeFields(block.text, config.values),
          },
        ],
  );

  const executionBlocks =
    context.mode === 'signed'
      ? buildExecutionBlocks(context, config.values)
      : [];

  return {
    region: config.region,
    templateVersion: DPA_TEMPLATE_VERSION,
    lastUpdatedLabel: DPA_LAST_UPDATED_LABEL,
    title: DPA_DOCUMENT_TITLE,
    sccSectionActive: config.sccSectionActive,
    values: { ...config.values },
    blocks: [...bodyBlocks, ...executionBlocks],
    // The self-hosted "not a valid agreement" banner and the executed signature
    // block are mutually exclusive: a signed/executed copy (which carries the
    // signature block + execution date) must never also say the DPA does not
    // apply. So the banner only appears in preview mode.
    notice:
      context.isSelfHosted === true && context.mode !== 'signed'
        ? SELF_HOSTED_NOTICE
        : undefined,
  };
};

// Helper used by tests (and callers that want to assert completeness): returns
// the list of unresolved {{...}} tokens remaining in a resolved document.
export const findUnresolvedMergeFields = (resolved: ResolvedDpa): string[] => {
  const unresolved = new Set<string>();

  for (const block of resolved.blocks) {
    const haystack = `${block.text}\n${block.value ?? ''}`;
    const matches = haystack.match(/\{\{[^}]+\}\}/g);

    if (matches) {
      for (const match of matches) {
        unresolved.add(match);
      }
    }
  }

  return [...unresolved];
};
