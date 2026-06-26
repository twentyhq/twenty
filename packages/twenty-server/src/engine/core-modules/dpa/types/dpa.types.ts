// Core domain types for the self-serve DPA (Data Processing Agreement).
// These are framework-agnostic on purpose: the resolver, the HTML renderer and
// the react-pdf document all consume the same resolved shape, so the legal text
// is filled in exactly one place and can never diverge between preview and PDF.

// The deployment region determines the contracting Processor entity and terms.
// It maps to where Customer Personal Data actually lives (see KEY RULES in the
// build spec). EU is the default; US is a custom deployment.
export type DpaRegion = 'EU' | 'US';

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

export type DpaTemplateBlock = {
  kind: DpaBlockKind;
  text: string;
  // When set, the block is only included if the resolved condition is true.
  includeWhen?: DpaConditionKey;
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
};
