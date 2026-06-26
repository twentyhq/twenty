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
import {
  type DpaResolveContext,
  type ResolvedDpa,
  type ResolvedDpaBlock,
} from 'src/engine/core-modules/dpa/types/dpa.types';

const MERGE_FIELD_PATTERN = /\{\{([A-Z_]+)\}\}/g;

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

  const conditions: Record<string, boolean> = {
    sccSectionActive: config.sccSectionActive,
  };

  const bodyBlocks: ResolvedDpaBlock[] = DPA_TEMPLATE_BLOCKS.filter(
    (block) =>
      // No includeWhen → always present (this is how SCC sections 7.2–7.5 stay
      // in the document for every region). With includeWhen → toggled.
      block.includeWhen === undefined || conditions[block.includeWhen] === true,
  ).map((block) => ({
    kind: block.kind,
    text: fillMergeFields(block.text, config.values),
  }));

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
