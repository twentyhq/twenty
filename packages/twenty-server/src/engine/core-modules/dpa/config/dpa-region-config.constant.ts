import {
  type DpaMergeField,
  type DpaRegion,
  type DpaRegionConfig,
} from 'src/engine/core-modules/dpa/types/dpa.types';

// The variable matrix as code. This is the single source of truth mapping a
// deployment region to the contracting Processor entity and terms.
//
// KEY RULES (from the build spec — do not deviate):
//  - The named Processor must match where Customer Personal Data actually lives.
//  - EU deployment (default): Twenty.com SAS, hosting EU/Frankfurt, law France,
//    SCC section dormant (no third-country transfer required).
//  - US deployment (custom): Twenty, Inc., hosting US; for EEA/UK/Swiss
//    customers the SCC section activates.
//  - Billing is independent (Twenty, Inc. is always merchant of record). Do NOT
//    couple DPA generation to the billing entity.
//
// ⚠ TODO_CONFIRM (legal to supply before go-live): the two registered-office
// addresses, the US governing law, and the DPO name. These are merge-field
// VALUES that are not present in the template body; placeholders below are
// clearly marked so nothing incorrect ships silently.
const TODO_CONFIRM = (what: string): string => `[TODO_CONFIRM: ${what}]`;

export const DEFAULT_DPA_REGION: DpaRegion = 'EU';

export const DPA_REGION_CONFIGS: Record<DpaRegion, DpaRegionConfig> = {
  EU: {
    region: 'EU',
    sccSectionActive: false,
    values: {
      PROCESSOR_ENTITY: 'Twenty.com SAS',
      PROCESSOR_LEGAL_FORM:
        'a société par actions simplifiée under the laws of France',
      PROCESSOR_ADDRESS: TODO_CONFIRM('Twenty.com SAS registered office address'),
      HOSTING_REGION: 'the EU (Frankfurt, Germany)',
      GOVERNING_LAW: 'France',
      DPO_NAME_AND_CONTACT: 'privacy@twenty.com',
    },
  },
  US: {
    region: 'US',
    sccSectionActive: true,
    values: {
      PROCESSOR_ENTITY: 'Twenty, Inc.',
      PROCESSOR_LEGAL_FORM:
        'a public benefit corporation under the laws of Delaware, USA',
      PROCESSOR_ADDRESS: TODO_CONFIRM('Twenty, Inc. registered office address'),
      HOSTING_REGION: 'the United States',
      // The template only specifies France (EU default); US law is not given in
      // the source document and must be confirmed by legal.
      GOVERNING_LAW: TODO_CONFIRM('US deployment governing law'),
      DPO_NAME_AND_CONTACT: 'privacy@twenty.com',
    },
  },
};

// The pre-set Twenty signatory ("pre-signed by Twenty"). v1 has no e-sign
// integration; this is the authorized-signatory block Twenty stamps on every
// generated copy. A future e-sign provider would replace this constant + the
// signed-mode branch in resolve-dpa.util.ts.
// ⚠ TODO_CONFIRM: real authorized signatory name/title.
export const TWENTY_PRESIGNED_SIGNATORY = {
  name: TODO_CONFIRM('Twenty authorized signatory name'),
  title: TODO_CONFIRM('Twenty authorized signatory title'),
};

export const getDpaRegionConfig = (region: DpaRegion): DpaRegionConfig =>
  DPA_REGION_CONFIGS[region] ?? DPA_REGION_CONFIGS[DEFAULT_DPA_REGION];

export const DPA_MERGE_FIELDS: DpaMergeField[] = [
  'PROCESSOR_ENTITY',
  'PROCESSOR_LEGAL_FORM',
  'PROCESSOR_ADDRESS',
  'HOSTING_REGION',
  'GOVERNING_LAW',
  'DPO_NAME_AND_CONTACT',
];
