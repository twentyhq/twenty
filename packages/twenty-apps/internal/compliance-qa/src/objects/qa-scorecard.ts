import { defineObject, FieldType } from 'twenty-sdk';

// Object
export const QA_SCORECARD_OBJECT_UNIVERSAL_IDENTIFIER =
  'a3e5c7b1-8d46-4f2a-9e1c-5b3d7a9f1e02';

// Field identifiers
export const NAME_FIELD_ID = 'b4f6d8c2-9e57-4a3b-af2d-6c4e8b0a2f13';
export const OVERALL_SCORE_FIELD_ID = 'c5a7e9d3-0f68-4b4c-ba3e-7d5f9c1b3a24';
export const OVERALL_RESULT_FIELD_ID = '4dca7ef6-ff56-49a8-9965-fddf0da94b24';
export const CALL_TYPE_FIELD_ID = '0dcd9235-1658-4e73-be5b-1a8df13ab4d4';

// Red flag fields
export const RED_FLAG_RECORDED_LINE_ID =
  '552fb185-ccb3-4c3a-93a3-7489a702b05f';
export const RED_FLAG_MARKETPLACE_ID =
  '265edca0-7b14-4ebd-8649-c29b97323d8f';
export const RED_FLAG_AOR_ID = 'b0f2d4c8-5e13-4a9b-af8d-2c0e4b6a8f79';
export const RED_FLAG_COMMISSION_ID =
  'c1a3e5d9-6f24-4b0c-ba9e-3d1f5c7b9a80';
export const RED_FLAG_HEALTHSHERPA_ID =
  'd605da11-0ade-4e6a-8500-21c75d132eac';
export const RED_FLAG_AGENT_COACHING_ID =
  'a0bcfd1d-ef24-45c9-b525-5e610cf5518d';
export const RED_FLAG_DNC_VIOLATION_ID =
  '7749c2c8-fbe6-4e6b-9cba-50bd5fe7a77b';
export const HAS_RED_FLAG_FIELD_ID = '631ba702-2f06-41a3-b234-388c684b0770';

// Section score fields
export const OPENING_SCORE_FIELD_ID = 'b6f8d0c4-1e79-4a5b-af4d-8c6e0b2a4f35';
export const FACT_FINDING_SCORE_FIELD_ID =
  'c7a9e1d5-2f80-4b6c-ba5e-9d7f1c3b5a46';
export const ELIGIBILITY_SCORE_FIELD_ID =
  'ba8403de-11d2-4fa2-889e-0924748035f7';
export const PRESENTATION_SCORE_FIELD_ID =
  'd4420a95-cf85-4bed-b2c0-3dbab48d19ba';
export const APPLICATION_SCORE_FIELD_ID =
  '2e957ae5-c883-4024-9157-403a649f0f9a';
export const CLOSING_SCORE_FIELD_ID = '47eb3d5b-1625-41dd-b6b5-87e5cf89bbfa';

// Rich text fields
export const SCORE_DETAILS_FIELD_ID = 'b2f4d6c0-7e35-4a1b-af0d-4c2e6b8a0f91';
export const RED_FLAG_DETAILS_FIELD_ID =
  'c3a5e7d1-8f46-4b2c-ba1e-5d3f7c9b1a02';
export const TRANSCRIPT_FIELD_ID = '2a70ae05-75c2-401f-8494-6a32ed913887';
export const RECOMMENDATIONS_FIELD_ID =
  'a5057902-dfa4-47f2-b576-5a2c0dd9caf4';

// Status field
export const STATUS_FIELD_ID = '42b314a1-34ce-4862-9efb-0ff8b28942bf';

// Analyzed at field
export const ANALYZED_AT_FIELD_ID = 'ba569a0d-75f3-4c31-b442-e02c2bcd53ec';

export default defineObject({
  universalIdentifier: QA_SCORECARD_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'qaScorecard',
  namePlural: 'qaScorecards',
  labelSingular: 'QA Scorecard',
  labelPlural: 'QA Scorecards',
  description: 'Automated compliance QA scorecard for insurance sales calls',
  icon: 'IconClipboardCheck',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_ID,
  fields: [
    // Name (auto-generated label like "QA - Agent Name - 2026-03-05")
    {
      universalIdentifier: NAME_FIELD_ID,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Display name for this QA scorecard',
      icon: 'IconAbc',
    },

    // Overall score (0-100)
    {
      universalIdentifier: OVERALL_SCORE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'overallScore',
      label: 'Overall Score',
      description: 'Overall compliance score from 0 to 100',
      icon: 'IconPercentage',
    },

    // Overall result (PASS / FAIL / NEEDS_REVIEW)
    {
      universalIdentifier: OVERALL_RESULT_FIELD_ID,
      type: FieldType.SELECT,
      name: 'overallResult',
      label: 'Result',
      description: 'Overall pass/fail result',
      icon: 'IconCircleCheck',
      options: [
        {
          id: 'a1b2c3d4-0001-4000-8000-000000000001',
          value: 'PASS',
          label: 'Pass',
          position: 0,
          color: 'green',
        },
        {
          id: 'a1b2c3d4-0001-4000-8000-000000000002',
          value: 'FAIL',
          label: 'Fail',
          position: 1,
          color: 'red',
        },
        {
          id: 'a1b2c3d4-0001-4000-8000-000000000003',
          value: 'NEEDS_REVIEW',
          label: 'Needs Review',
          position: 2,
          color: 'orange',
        },
        {
          id: 'a1b2c3d4-0001-4000-8000-000000000004',
          value: 'NOT_APPLICABLE',
          label: 'Not Applicable',
          position: 3,
          color: 'gray',
        },
      ],
    },

    // Call type
    {
      universalIdentifier: CALL_TYPE_FIELD_ID,
      type: FieldType.SELECT,
      name: 'callType',
      label: 'Call Type',
      description: 'Type of insurance call',
      icon: 'IconPhoneCall',
      options: [
        {
          id: 'a1b2c3d4-0002-4000-8000-000000000001',
          value: 'ACA_SALE',
          label: 'ACA Sale',
          position: 0,
          color: 'blue',
        },
        {
          id: 'a1b2c3d4-0002-4000-8000-000000000002',
          value: 'ANCILLARY',
          label: 'Ancillary',
          position: 1,
          color: 'purple',
        },
        {
          id: 'a1b2c3d4-0002-4000-8000-000000000003',
          value: 'GENERAL',
          label: 'General',
          position: 2,
          color: 'gray',
        },
      ],
    },

    // === Red Flag Auto-Fail Fields ===
    {
      universalIdentifier: RED_FLAG_RECORDED_LINE_ID,
      type: FieldType.BOOLEAN,
      name: 'redFlagRecordedLine',
      label: 'Red Flag: Recorded Line',
      description: 'Failed to disclose the call is being recorded',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier: RED_FLAG_MARKETPLACE_ID,
      type: FieldType.BOOLEAN,
      name: 'redFlagMarketplace',
      label: 'Red Flag: Marketplace',
      description:
        'Failed to disclose not directly associated with the marketplace',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier: RED_FLAG_AOR_ID,
      type: FieldType.BOOLEAN,
      name: 'redFlagAor',
      label: 'Red Flag: AOR',
      description: 'Failed to properly handle Agent of Record disclosure',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier: RED_FLAG_COMMISSION_ID,
      type: FieldType.BOOLEAN,
      name: 'redFlagCommission',
      label: 'Red Flag: Commission',
      description: 'Failed to disclose commission-based compensation',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier: RED_FLAG_HEALTHSHERPA_ID,
      type: FieldType.BOOLEAN,
      name: 'redFlagHealthSherpa',
      label: 'Red Flag: HealthSherpa',
      description: 'Failed to provide HealthSherpa disclosure',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier: RED_FLAG_AGENT_COACHING_ID,
      type: FieldType.BOOLEAN,
      name: 'redFlagAgentCoaching',
      label: 'Red Flag: Agent Coaching',
      description: 'Agent coached the consumer on how to answer questions',
      icon: 'IconAlertTriangle',
    },
    {
      universalIdentifier: RED_FLAG_DNC_VIOLATION_ID,
      type: FieldType.BOOLEAN,
      name: 'redFlagDncViolation',
      label: 'Red Flag: DNC Violation',
      description: 'Do Not Call list violation',
      icon: 'IconAlertTriangle',
    },

    // Has any red flag (computed)
    {
      universalIdentifier: HAS_RED_FLAG_FIELD_ID,
      type: FieldType.BOOLEAN,
      name: 'hasRedFlag',
      label: 'Has Red Flag',
      description: 'Whether any red flag auto-fail was triggered',
      icon: 'IconFlag',
    },

    // === Section Scores (0-100 each) ===
    {
      universalIdentifier: OPENING_SCORE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'openingScore',
      label: 'Opening Score',
      description: 'Score for the opening section (0-100)',
      icon: 'IconDoor',
    },
    {
      universalIdentifier: FACT_FINDING_SCORE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'factFindingScore',
      label: 'Fact Finding Score',
      description: 'Score for the fact-finding section (0-100)',
      icon: 'IconSearch',
    },
    {
      universalIdentifier: ELIGIBILITY_SCORE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'eligibilityScore',
      label: 'Eligibility Score',
      description: 'Score for the eligibility assessment section (0-100)',
      icon: 'IconChecklist',
    },
    {
      universalIdentifier: PRESENTATION_SCORE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'presentationScore',
      label: 'Presentation Score',
      description: 'Score for the plan presentation section (0-100)',
      icon: 'IconPresentation',
    },
    {
      universalIdentifier: APPLICATION_SCORE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'applicationScore',
      label: 'Application Score',
      description: 'Score for the application process section (0-100)',
      icon: 'IconFileText',
    },
    {
      universalIdentifier: CLOSING_SCORE_FIELD_ID,
      type: FieldType.NUMBER,
      name: 'closingScore',
      label: 'Closing Score',
      description: 'Score for the closing section (0-100)',
      icon: 'IconCircleCheck',
    },

    // === Rich Text Detail Fields ===
    {
      universalIdentifier: SCORE_DETAILS_FIELD_ID,
      type: FieldType.RICH_TEXT,
      name: 'scoreDetails',
      label: 'Score Details',
      description:
        'Full breakdown of scoring with evidence quotes from transcript',
      icon: 'IconListDetails',
    },
    {
      universalIdentifier: RED_FLAG_DETAILS_FIELD_ID,
      type: FieldType.RICH_TEXT,
      name: 'redFlagDetails',
      label: 'Red Flag Details',
      description: 'Detailed explanations for any red flag violations',
      icon: 'IconAlertCircle',
    },
    {
      universalIdentifier: TRANSCRIPT_FIELD_ID,
      type: FieldType.RICH_TEXT,
      name: 'transcript',
      label: 'Transcript',
      description: 'Full transcript used for analysis',
      icon: 'IconMessage',
    },
    {
      universalIdentifier: RECOMMENDATIONS_FIELD_ID,
      type: FieldType.RICH_TEXT,
      name: 'recommendations',
      label: 'Recommendations',
      description: 'AI-generated coaching suggestions for the agent',
      icon: 'IconBulb',
    },

    // Status
    {
      universalIdentifier: STATUS_FIELD_ID,
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      description: 'Processing status of this QA scorecard',
      icon: 'IconStatusChange',
      defaultValue: "'PENDING'",
      options: [
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000001',
          value: 'PENDING',
          label: 'Pending',
          position: 0,
          color: 'gray',
        },
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000002',
          value: 'TRANSCRIBING',
          label: 'Transcribing',
          position: 1,
          color: 'blue',
        },
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000003',
          value: 'ANALYZING',
          label: 'Analyzing',
          position: 2,
          color: 'blue',
        },
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000004',
          value: 'COMPLETED',
          label: 'Completed',
          position: 3,
          color: 'green',
        },
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000005',
          value: 'FAILED',
          label: 'Failed',
          position: 4,
          color: 'red',
        },
        {
          id: 'a1b2c3d4-0003-4000-8000-000000000006',
          value: 'SKIPPED',
          label: 'Skipped',
          position: 5,
          color: 'gray',
        },
      ],
    },

    // Analyzed at
    {
      universalIdentifier: ANALYZED_AT_FIELD_ID,
      type: FieldType.DATE_TIME,
      name: 'analyzedAt',
      label: 'Analyzed At',
      description: 'When the compliance analysis was completed',
      icon: 'IconCalendar',
    },
  ],
});
