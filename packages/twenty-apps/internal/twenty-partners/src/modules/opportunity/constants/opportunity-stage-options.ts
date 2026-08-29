export const OPPORTUNITY_STAGE_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-6f76-477d-8551-28cd65b2b4b9';

/** Stock Opportunity.stage options plus partners archival stages. */
export const OPPORTUNITY_STAGE_OPTIONS = [
  {
    id: '20202020-8e01-4afd-9c39-d2063097587a',
    value: 'NEW',
    label: 'New',
    position: 0,
    color: 'red',
  },
  {
    id: '20202020-e685-4671-ac32-26d304dacb6e',
    value: 'SCREENING',
    label: 'Screening',
    position: 1,
    color: 'purple',
  },
  {
    id: '20202020-dde9-4acc-b5ca-f6531a8ecb4a',
    value: 'MEETING',
    label: 'Meeting',
    position: 2,
    color: 'sky',
  },
  {
    id: '20202020-696e-4f6b-91bc-f413e9b2f654',
    value: 'PROPOSAL',
    label: 'Proposal',
    position: 3,
    color: 'turquoise',
  },
  {
    id: '20202020-0bb5-4a6f-a8b2-774bbad21104',
    value: 'CUSTOMER',
    label: 'Customer',
    position: 4,
    color: 'yellow',
  },
  {
    id: 'f3a8c2d1-9e4b-4f7a-8c3d-2b1e0f9a8c7d',
    value: 'DONE',
    label: 'Done',
    position: 5,
    color: 'green',
  },
  {
    id: 'e7d6c5b4-a3f2-4e1d-9c0b-8a7f6e5d4c3b',
    value: 'DEAD',
    label: 'Dead',
    position: 6,
    color: 'gray',
  },
] as const;

export type OpportunityStageValue =
  (typeof OPPORTUNITY_STAGE_OPTIONS)[number]['value'];
