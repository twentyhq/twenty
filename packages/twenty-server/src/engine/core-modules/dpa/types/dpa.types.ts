import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';

export { DpaRegion };

export type DpaMergeField =
  | 'PROCESSOR_ENTITY'
  | 'PROCESSOR_LEGAL_FORM'
  | 'PROCESSOR_ADDRESS'
  | 'HOSTING_REGION'
  | 'GOVERNING_LAW'
  | 'DPO_NAME_AND_CONTACT';

// SCC transfer sections (7.2–7.5) are NEVER branched out of the document; only
// field values change per region. This key exists so the conditional-clause
// mechanism is available for future optional clauses and is exercised by tests.
export type DpaConditionKey = 'sccSectionActive';

export type DpaBlockKind = 'heading' | 'paragraph';

export type DpaBlockExpansion = 'subprocessorList';

export type DpaTemplateBlock = {
  kind: DpaBlockKind;
  text: string;
  includeWhen?: DpaConditionKey;
  expand?: DpaBlockExpansion;
};

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
  // Passed in (never read from the clock here) so the resolver stays pure.
  executedAt?: string;
  // Twenty is not the Processor for self-hosted deployments, so the resolved
  // document carries a prominent "not a valid agreement" notice.
  isSelfHosted?: boolean;
};

export type ResolvedDpaBlock = {
  kind: 'heading' | 'paragraph' | 'signatureField';
  text: string;
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
  notice?: string;
};
