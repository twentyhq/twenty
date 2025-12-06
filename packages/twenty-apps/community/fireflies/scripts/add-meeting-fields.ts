/**
 * Migration script to add custom fields to the Meeting object
 * Run this after: npx twenty-cli app sync packages/twenty-apps/fireflies
 *
 * Usage: yarn setup:fields
 */

/* eslint-disable no-console */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const API_KEY = process.env.TWENTY_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: TWENTY_API_KEY not found in .env file');
  process.exit(1);
}

interface RelationCreationPayload {
  targetObjectMetadataId: string;
  targetFieldLabel: string;
  targetFieldIcon: string;
  type: 'ONE_TO_MANY' | 'MANY_TO_ONE';
}

interface FieldOption {
  value: string;
  label: string;
  position: number;
  color: string;
}

interface FieldDefinition {
  type: string;
  name: string;
  label: string;
  description: string;
  icon?: string;
  isNullable?: boolean;
  relationCreationPayload?: RelationCreationPayload;
  options?: FieldOption[];
}

// Meeting fields based on Fireflies GraphQL API transcript schema
// See: https://docs.fireflies.ai/graphql-api/query/transcript
// Note: Some fields require higher plans (Pro, Business, Enterprise)
const MEETING_FIELDS: FieldDefinition[] = [
  // === Internal Twenty Relations ===
  {
    type: 'RELATION',
    name: 'note',
    label: 'Meeting Note',
    description: 'Related note with detailed meeting content',
    icon: 'IconNotes',
    isNullable: true,
  },

  // === Basic Fields (All Plans) ===
  {
    type: 'TEXT',
    name: 'firefliesMeetingId',
    label: 'Fireflies ID',
    description: 'Unique transcript ID from Fireflies (maps to: id)',
    icon: 'IconKey',
    isNullable: true,
  },
  {
    type: 'DATE_TIME',
    name: 'meetingDate',
    label: 'Meeting Date',
    description: 'When the meeting occurred (maps to: date)',
    icon: 'IconCalendar',
    isNullable: true,
  },
  {
    type: 'NUMBER',
    name: 'duration',
    label: 'Duration (minutes)',
    description: 'Meeting duration in minutes (maps to: duration)',
    icon: 'IconClock',
    isNullable: true,
  },
  {
    type: 'TEXT',
    name: 'organizerEmail',
    label: 'Organizer Email',
    description: 'Meeting organizer email (maps to: organizer_email)',
    icon: 'IconMail',
    isNullable: true,
  },
  {
    type: 'LINKS',
    name: 'transcriptUrl',
    label: 'Transcript URL',
    description: 'Link to full transcript (maps to: transcript_url)',
    icon: 'IconFileText',
    isNullable: true,
  },
  {
    type: 'LINKS',
    name: 'meetingLink',
    label: 'Meeting Link',
    description: 'Original meeting link (maps to: meeting_link)',
    icon: 'IconLink',
    isNullable: true,
  },

  // === Pro+ Fields (summary, speakers, audio_url, transcript) ===
  {
    type: 'TEXT',
    name: 'transcript',
    label: 'Full Transcript',
    description: 'Full meeting transcript with speaker names and timestamps [Pro+]',
    icon: 'IconFileText',
    isNullable: true,
  },
  {
    type: 'TEXT',
    name: 'overview',
    label: 'Overview',
    description: 'AI-generated meeting summary (maps to: summary.overview) [Pro+]',
    icon: 'IconFileDescription',
    isNullable: true,
  },
  {
    type: 'TEXT',
    name: 'notes',
    label: 'AI Notes',
    description: 'Detailed AI-generated meeting notes (maps to: summary.notes) [Pro+]',
    icon: 'IconNotes',
    isNullable: true,
  },
  {
    type: 'TEXT',
    name: 'keywords',
    label: 'Keywords',
    description: 'Key topics extracted (maps to: summary.keywords) [Pro+]',
    icon: 'IconTags',
    isNullable: true,
  },
  {
    type: 'LINKS',
    name: 'audioUrl',
    label: 'Audio URL',
    description: 'Link to audio recording (maps to: audio_url) [Pro+]',
    icon: 'IconHeadphones',
    isNullable: true,
  },

  // === Business+ Fields (analytics, video_url, full summary) ===
  {
    type: 'TEXT',
    name: 'meetingType',
    label: 'Meeting Type',
    description: 'AI-detected meeting type (maps to: summary.meeting_type) [Business+]',
    icon: 'IconTag',
    isNullable: true,
  },
  {
    type: 'TEXT',
    name: 'topics',
    label: 'Topics Discussed',
    description: 'Topics covered in meeting (maps to: summary.topics_discussed) [Business+]',
    icon: 'IconListDetails',
    isNullable: true,
  },
  {
    type: 'NUMBER',
    name: 'actionItemsCount',
    label: 'Action Items',
    description: 'Number of action items (count of: summary.action_items) [Business+]',
    icon: 'IconCheckbox',
    isNullable: true,
  },
  {
    type: 'NUMBER',
    name: 'positivePercent',
    label: 'Positive %',
    description: 'Positive sentiment % (maps to: analytics.sentiments.positive_pct) [Business+]',
    icon: 'IconThumbUp',
    isNullable: true,
  },
  {
    type: 'NUMBER',
    name: 'negativePercent',
    label: 'Negative %',
    description: 'Negative sentiment % (maps to: analytics.sentiments.negative_pct) [Business+]',
    icon: 'IconThumbDown',
    isNullable: true,
  },
  {
    type: 'NUMBER',
    name: 'neutralPercent',
    label: 'Neutral %',
    description: 'Neutral sentiment % (maps to: analytics.sentiments.neutral_pct) [Business+]',
    icon: 'IconMoodNeutral',
    isNullable: true,
  },
  {
    type: 'LINKS',
    name: 'videoUrl',
    label: 'Video URL',
    description: 'Link to video recording (maps to: video_url) [Business+]',
    icon: 'IconVideo',
    isNullable: true,
  },

  // === Import Tracking Fields (Internal) ===
  {
    type: 'SELECT',
    name: 'importStatus',
    label: 'Import Status',
    description: 'Status of the Fireflies import',
    icon: 'IconCheck',
    isNullable: true,
    options: [
      { value: 'SUCCESS', label: 'Success', position: 0, color: 'green' },
      { value: 'PARTIAL', label: 'Partial', position: 1, color: 'blue' },
      { value: 'FAILED', label: 'Failed', position: 2, color: 'red' },
      { value: 'PENDING', label: 'Pending', position: 3, color: 'yellow' },
      { value: 'RETRYING', label: 'Retrying', position: 4, color: 'orange' },
    ],
  },
  {
    type: 'TEXT',
    name: 'importError',
    label: 'Import Error',
    description: 'Error message if import failed',
    icon: 'IconAlertTriangle',
    isNullable: true,
  },
  {
    type: 'DATE_TIME',
    name: 'lastImportAttempt',
    label: 'Last Import Attempt',
    description: 'When import was last attempted',
    icon: 'IconClock',
    isNullable: true,
  },
  {
    type: 'NUMBER',
    name: 'importAttempts',
    label: 'Import Attempts',
    description: 'Number of import attempts',
    icon: 'IconRepeat',
    isNullable: true,
  },
];

const graphqlRequest = async (query: string, variables: Record<string, unknown> = {}) => {
  const response = await fetch(`${SERVER_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GraphQL request failed (${response.status}): ${errorText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`);
  }

  return json.data;
};

const findMeetingObject = async () => {
  const query = `
    query FindMeetingObject {
      objects(paging: { first: 200 }) {
        edges {
          node {
            id
            nameSingular
            labelSingular
            labelPlural
            fields {
              edges {
                node {
                  id
                  name
                  label
                  type
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(query);
  const edges = data.objects?.edges || [];
  const meetingEdge = edges.find(
    (edge: any) => edge?.node?.nameSingular === 'meeting',
  );

  if (!meetingEdge) {
    throw new Error('Meeting object not found. Please run "npx twenty-cli app sync" first.');
  }

  return meetingEdge.node;
};

const findNoteObject = async () => {
  const query = `
    query FindObjects {
      objects(paging: { first: 100 }) {
        edges {
          node {
            id
            nameSingular
            labelSingular
          }
        }
      }
    }
  `;

  const data = await graphqlRequest(query);
  const edges = data.objects?.edges || [];
  const noteEdge = edges.find(
    (edge: any) => edge?.node?.nameSingular === 'note',
  );

  if (!noteEdge) {
    throw new Error('Note object not found.');
  }

  return noteEdge.node;
};

const createField = async (objectId: string, field: FieldDefinition) => {
  const mutation = `
    mutation CreateField($input: CreateOneFieldMetadataInput!) {
      createOneField(input: $input) {
        id
        name
        label
        type
        description
      }
    }
  `;

  const input = {
    field: {
      type: field.type,
      name: field.name,
      label: field.label,
      description: field.description,
      icon: field.icon || 'IconAbc',
      isNullable: field.isNullable !== false,
      isActive: true,
      isCustom: true,
      objectMetadataId: objectId,
      ...(field.relationCreationPayload && {
        relationCreationPayload: field.relationCreationPayload,
      }),
      ...(field.options && {
        options: field.options,
      }),
    },
  };

  try {
    const data = await graphqlRequest(mutation, { input });
    return data.createOneField;
  } catch (error) {
    if (error instanceof Error) {
      const message = error.message;
      if (
        message.includes('already exists') ||
        message.includes('not available') ||
        message.includes('Duplicating')
      ) {
        return null;
      }
    }
    throw error;
  }
};

const main = async () => {
  console.log('🚀 Adding custom fields to Meeting object...\n');

  try {
    // Step 1: Find Meeting and Note objects
    console.log('📋 Finding Meeting object...');
    const meetingObject = await findMeetingObject();
    console.log(`✅ Found Meeting object: ${meetingObject.labelSingular ?? meetingObject.nameSingular ?? 'Meeting'} (ID: ${meetingObject.id})\n`);

    console.log('📋 Finding Note object...');
    const noteObject = await findNoteObject();
    console.log(`✅ Found Note object: ${noteObject.labelSingular ?? noteObject.nameSingular ?? 'Note'} (ID: ${noteObject.id})\n`);

    // Step 2: Update note field with relationCreationPayload
    const fieldsToCreate = MEETING_FIELDS.map(field => {
      if (field.name === 'note' && field.type === 'RELATION') {
        return {
          ...field,
          relationCreationPayload: {
            targetObjectMetadataId: noteObject.id,
            targetFieldLabel: 'Meeting',
            targetFieldIcon: 'IconCalendarEvent',
            type: 'MANY_TO_ONE' as const,
          },
        };
      }
      return field;
    });

    // Step 3: Check existing fields
    const existingFields = meetingObject.fields?.edges?.map((edge: any) => edge.node.name) || [];
    console.log(`📌 Existing fields: ${existingFields.join(', ')}\n`);

    // Step 4: Create custom fields
    console.log('➕ Creating custom fields...\n');

    let createdCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const field of fieldsToCreate) {
      try {
        if (existingFields.includes(field.name)) {
          console.log(`   ⏭️  ${field.name} - already exists`);
          skippedCount++;
          continue;
        }

        const result = await createField(meetingObject.id, field);

        if (result) {
          console.log(`   ✅ ${field.name} - created successfully`);
          createdCount++;
        } else {
          console.log(`   ⏭️  ${field.name} - skipped (already exists)`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`   ❌ ${field.name} - failed: ${error instanceof Error ? error.message : String(error)}`);
        failedCount++;
      }
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Created: ${createdCount} fields`);
    console.log(`   ⏭️  Skipped: ${skippedCount} fields`);
    console.log(`   ❌ Failed: ${failedCount} fields`);
    console.log('='.repeat(60));

    if (failedCount > 0) {
      console.log('\n⚠️  Some fields failed to create. Please check the errors above.');
      process.exit(1);
    }

    if (createdCount === 0 && skippedCount === MEETING_FIELDS.length) {
      console.log('\n✨ All fields already exist. Nothing to do!\n');
    } else if (createdCount > 0) {
      console.log('\n✨ Custom fields added successfully!\n');
    }

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

