/**
 * Stage-gate rules.
 *
 * PHASE 1: rules are declared here as constants so the mechanism can be proven
 * end-to-end before investing in the DB-backed rules table + admin UI.
 * The shape below intentionally mirrors the planned `core.validationRule`
 * columns so moving to DB storage is a swap of the loader, not a rewrite.
 */

export type ValidationRequirement =
  | {
      type: 'filesFieldNotEmpty';
      field: string;
      message: string;
    }
  | {
      type: 'relationNotEmpty';
      /** target object metadata name (the CHILD holding the FK) */
      targetObjectNameSingular: string;
      /** FK column on the child pointing back at this record */
      foreignKeyColumn: string;
      min: number;
      message: string;
    };

export interface ValidationRule {
  objectNameSingular: string;
  /** field that must be changing */
  whenField: string;
  /** value it must be changing TO */
  whenChangesTo: string;
  requirements: ValidationRequirement[];
}

export const VALIDATION_RULES: ValidationRule[] = [
  {
    objectNameSingular: 'opportunity',
    whenField: 'stage',
    whenChangesTo: 'PROPOSAL_SENT',
    requirements: [
      {
        type: 'relationNotEmpty',
        targetObjectNameSingular: 'productServiceCatalog',
        foreignKeyColumn: 'opportunitiesId',
        min: 1,
        message:
          'Add at least one Product / Service Catalog item before moving to Proposal Sent.',
      },
      {
        type: 'filesFieldNotEmpty',
        field: 'proposalAttachment',
        message:
          'Upload the Proposal document before moving to Proposal Sent.',
      },
    ],
  },
];
