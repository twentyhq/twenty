import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';
import { type DpaRegionConfig } from 'src/engine/core-modules/dpa/types/dpa.types';

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
// These are the merge-field VALUES that are not present in the template body.
// All values are confirmed (registered offices, governing law, signatory, DPO).

export const DEFAULT_DPA_REGION: DpaRegion = DpaRegion.EU;

export const DPA_REGION_CONFIGS: Record<DpaRegion, DpaRegionConfig> = {
  [DpaRegion.EU]: {
    region: DpaRegion.EU,
    sccSectionActive: false,
    values: {
      PROCESSOR_ENTITY: 'Twenty.com SAS',
      PROCESSOR_LEGAL_FORM:
        'a société par actions simplifiée under the laws of France',
      PROCESSOR_ADDRESS: '9 Rue des Colonnes, 75002 Paris, France',
      HOSTING_REGION: 'the EU (Frankfurt, Germany)',
      GOVERNING_LAW: 'France',
      DPO_NAME_AND_CONTACT: 'privacy@twenty.com',
    },
  },
  [DpaRegion.US]: {
    region: DpaRegion.US,
    sccSectionActive: true,
    values: {
      PROCESSOR_ENTITY: 'Twenty, Inc.',
      PROCESSOR_LEGAL_FORM:
        'a public benefit corporation under the laws of Delaware, USA',
      // Registered office is the Delaware registered agent (standard for a
      // Delaware corporation); the SF address is the notices/contact address.
      PROCESSOR_ADDRESS:
        'c/o National Registered Agents, Inc., 1209 Orange Street, Wilmington, Delaware 19801, USA; notices to 2261 Market Street #5275, San Francisco, California 94114, USA',
      HOSTING_REGION: 'the United States',
      GOVERNING_LAW: 'the State of Delaware, USA',
      DPO_NAME_AND_CONTACT: 'privacy@twenty.com',
    },
  },
};

// The pre-set Twenty signatory ("pre-signed by Twenty"). v1 has no e-sign
// integration; this is the authorized-signatory block Twenty stamps on every
// generated copy. A future e-sign provider would replace this constant + the
// signed-mode branch in resolve-dpa.util.ts.
export const TWENTY_PRESIGNED_SIGNATORY = {
  name: 'Félix Malfait',
  title: 'Chief Executive Officer',
};

export const getDpaRegionConfig = (region: DpaRegion): DpaRegionConfig =>
  DPA_REGION_CONFIGS[region] ?? DPA_REGION_CONFIGS[DEFAULT_DPA_REGION];
