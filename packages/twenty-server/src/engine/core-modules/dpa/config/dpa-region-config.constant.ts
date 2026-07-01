import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';
import { type DpaRegionConfig } from 'src/engine/core-modules/dpa/types/dpa.types';

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
      HOSTING_REGION: 'EU (Frankfurt, Germany)',
      GOVERNING_LAW: 'France',
      DPO_NAME_AND_CONTACT: 'Stéphanie Joly, privacy@twenty.com',
    },
  },
  [DpaRegion.US]: {
    region: DpaRegion.US,
    sccSectionActive: true,
    values: {
      PROCESSOR_ENTITY: 'Twenty.com PBC',
      PROCESSOR_LEGAL_FORM:
        'a public benefit corporation under the laws of Delaware, USA',
      // Registered office is the Delaware registered agent; the SF notices
      // address is kept distinct so the two are not conflated under one label.
      PROCESSOR_ADDRESS:
        'c/o National Registered Agents, Inc., 1209 Orange Street, Wilmington, Delaware 19801, USA. For notices: 2261 Market Street #5275, San Francisco, California 94114, USA',
      HOSTING_REGION: 'United States',
      GOVERNING_LAW: 'the State of Delaware, USA',
      DPO_NAME_AND_CONTACT: 'Stéphanie Joly, privacy@twenty.com',
    },
  },
};

export const TWENTY_PRESIGNED_SIGNATORY = {
  name: 'Félix Malfait',
  title: 'Chief Executive Officer',
};

export const getDpaRegionConfig = (region: DpaRegion): DpaRegionConfig =>
  DPA_REGION_CONFIGS[region] ?? DPA_REGION_CONFIGS[DEFAULT_DPA_REGION];
