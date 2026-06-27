// Core domain types for the self-serve DPA (Data Processing Agreement).
// These are framework-agnostic on purpose: the resolver, the HTML renderer and
// the react-pdf document all consume the same resolved shape, so the legal text
// is filled in exactly one place and can never diverge between preview and PDF.

// DpaRegion is a GraphQL-exposed enum (see enums/dpa-region.enum.ts). Re-exported
// here so domain types in this file (and existing importers) can reference it.
import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';

export { DpaRegion };

// The six merge fields present in the verbatim template ({{DOUBLE_BRACES}}).
export type DpaMergeField =
  | 'PROCESSOR_ENTITY'
  | 'PROCESSOR_LEGAL_FORM'
  | 'PROCESSOR_ADDRESS'
  | 'HOSTING_REGION'
  | 'GOVERNING_LAW'
  | 'DPO_NAME_AND_CONTACT';

// Keys for the general conditional-clause mechanism. Per the build spec the SCC
// transfer sections (7.2–7.5) are NEVER branched out of the document; only field
// values change per region. This key exists so the mechanism is available for
// genuinely optional future clauses and is exercised by the renderer tests.
export type DpaConditionKey = 'sccSectionActive';

export type DpaBlockKind = 'heading' | 'paragraph';

// A template block can expand at resolve time into a generated list of blocks
// (today: the Sub-Processor entries sourced from subprocessors.json, which is
// synced from the Trust Center). The sentinel block's own text is discarded.
export type DpaBlockExpansion = 'subprocessorList';

export type DpaTemplateBlock = {
  kind: DpaBlockKind;
  text: string;
  // When set, the block is only included if the resolved condition is true.
  includeWhen?: DpaConditionKey;
  // When set, the block is replaced at resolve time by generated blocks.
  expand?: DpaBlockExpansion;
};

// The per-region variable matrix: the resolved value for each merge field plus
// whether the SCC/transfer mechanism is active (dormant for EU, active for US).
export type DpaRegionConfig = {
  region: DpaRegion;
  values: Record<DpaMergeField, string>;
  sccSectionActive: boolean;
};

export type DpaRenderMode = 'preview' | 'clickThrough' | 'signed';

export type DpaSignatory = {
  name: string;
  title: string;
};

export type DpaResolveContext = {
  region: DpaRegion;
  mode: DpaRenderMode;
  customerLegalEntityName?: string;
  signatory?: DpaSignatory;
  // ISO timestamp of execution. Passed in (never read from the clock here) so
  // the resolver stays pure and deterministic.
  executedAt?: string;
  // True for self-hosted deployments (billing disabled). Twenty is not the
  // Processor for self-hosted, so the resolved document carries a prominent
  // "not a valid agreement" notice.
  isSelfHosted?: boolean;
};

export type ResolvedDpaBlock = {
  kind: 'heading' | 'paragraph' | 'signatureField';
  text: string;
  // Only set for signatureField blocks (label/value pair).
  label?: string;
  value?: string;
};

export type ResolvedDpa = {
  region: DpaRegion;
  templateVersion: string;
  lastUpdatedLabel: string;
  title: string;
  sccSectionActive: boolean;
  values: Record<DpaMergeField, string>;
  blocks: ResolvedDpaBlock[];
  // Prominent warning rendered at the top of the preview/PDF when the document
  // does not constitute a valid agreement (self-hosted deployments).
  notice?: string;
};
