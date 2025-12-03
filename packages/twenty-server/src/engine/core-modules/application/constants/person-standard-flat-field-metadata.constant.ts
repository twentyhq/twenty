import { FieldMetadataType } from 'twenty-shared/types';

import { TWENTY_STANDARD_APPLICATION } from 'src/engine/core-modules/application/constants/twenty-standard-applications';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { StandardFieldMetadataIdByObjectAndFieldName } from 'src/engine/core-modules/application/constants/get-standard-field-metadata-id-by-object-and-field-name.util';
import { AllStandardObjectFieldName } from 'src/engine/core-modules/application/types/all-standard-object-field-name.type';
import { STANDARD_OBJECTS } from './standard-object.constant';

const TWENTY_STANDARD_APPLICATION_ID =
  TWENTY_STANDARD_APPLICATION.universalIdentifier;

// Placeholder workspace ID for standard application constant
const PLACEHOLDER_WORKSPACE_ID = '';

type CreateStandardFieldFlatMetadataOptions = {
  fieldName: AllStandardObjectFieldName<'person'>;
  type: FieldMetadataType;
  label: string;
  description: string;
  icon: string;
  isSystem?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
  isUIReadOnly?: boolean;
  defaultValue?: unknown;
  settings?: Record<string, unknown> | null;
  options?: unknown;
  createdAt: Date;
};

type CreateStandardFieldFlatMetadataArgs = {
  options: CreateStandardFieldFlatMetadataOptions;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
};

const createStandardFieldFlatMetadata = ({
  options: {
    fieldName,
    type,
    label,
    description,
    icon,
    isSystem = false,
    isNullable = true,
    isUnique = false,
    isUIReadOnly = false,
    defaultValue = null,
    settings = null,
    options = null,
    createdAt,
  },
  standardFieldMetadataIdByObjectAndFieldName,
}: CreateStandardFieldFlatMetadataArgs): FlatFieldMetadata => ({
  id: standardFieldMetadataIdByObjectAndFieldName.person.fields[fieldName],
  universalIdentifier:
    STANDARD_OBJECTS.person.fields[fieldName].universalIdentifier,
  standardId: STANDARD_OBJECTS.person.fields[fieldName].universalIdentifier,
  applicationId: TWENTY_STANDARD_APPLICATION_ID,
  workspaceId: PLACEHOLDER_WORKSPACE_ID,
  objectMetadataId: standardFieldMetadataIdByObjectAndFieldName.person.id,
  type,
  name: fieldName,
  label,
  description,
  icon,
  isCustom: false,
  isActive: true,
  isSystem,
  isNullable,
  isUnique,
  isUIReadOnly,
  isLabelSyncedWithName: false,
  standardOverrides: null,
  defaultValue,
  settings,
  options,
  relationTargetFieldMetadataId: null,
  relationTargetObjectMetadataId: null,
  morphId: null,
  viewFieldIds: [],
  viewFilterIds: [],
  viewGroupIds: [],
  kanbanAggregateOperationViewIds: [],
  calendarViewIds: [],
  mainGroupByFieldMetadataViewIds: [],
  createdAt,
  updatedAt: createdAt,
});

export const buildPersonStandardFlatFieldMetadatas = ({
  createdAt,
  standardFieldMetadataIdByObjectAndFieldName,
}: {
  createdAt: Date;
  standardFieldMetadataIdByObjectAndFieldName: StandardFieldMetadataIdByObjectAndFieldName;
}): Record<AllStandardObjectFieldName<'person'>, FlatFieldMetadata> => ({
  // Base fields from BaseWorkspaceEntity
  id: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
      description: 'Id',
      icon: 'Icon123',
      isSystem: true,
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'uuid',
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdAt: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'createdAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Creation date',
      description: 'Creation date',
      icon: 'IconCalendar',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  updatedAt: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'updatedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Last update',
      description: 'Last time the record was changed',
      icon: 'IconCalendarClock',
      isNullable: false,
      isUIReadOnly: true,
      defaultValue: 'now',
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  deletedAt: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'deletedAt',
      type: FieldMetadataType.DATE_TIME,
      label: 'Deleted at',
      description: 'Date when the record was deleted',
      icon: 'IconCalendarMinus',
      isNullable: true,
      isUIReadOnly: true,
      settings: {
        displayFormat: 'RELATIVE',
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Person-specific fields
  name: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'name',
      type: FieldMetadataType.FULL_NAME,
      label: 'Name',
      description: "Contact's name",
      icon: 'IconUser',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  email: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'email',
      type: FieldMetadataType.TEXT,
      label: 'Email',
      description: "Contact's Email (deprecated)",
      icon: 'IconMail',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  emails: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'emails',
      type: FieldMetadataType.EMAILS,
      label: 'Emails',
      description: "Contact's Emails",
      icon: 'IconMail',
      isNullable: true,
      isUnique: true,
      settings: {
        maxNumberOfValues: 1,
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  linkedinLink: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'linkedinLink',
      type: FieldMetadataType.LINKS,
      label: 'Linkedin',
      description: "Contact's Linkedin account",
      icon: 'IconBrandLinkedin',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  xLink: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'xLink',
      type: FieldMetadataType.LINKS,
      label: 'X',
      description: "Contact's X/Twitter account",
      icon: 'IconBrandX',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  jobTitle: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'jobTitle',
      type: FieldMetadataType.TEXT,
      label: 'Job Title',
      description: "Contact's job title",
      icon: 'IconBriefcase',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  phone: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'phone',
      type: FieldMetadataType.TEXT,
      label: 'Phone',
      description: "Contact's phone number (deprecated)",
      icon: 'IconPhone',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  phones: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'phones',
      type: FieldMetadataType.PHONES,
      label: 'Phones',
      description: "Contact's phone numbers",
      icon: 'IconPhone',
      isNullable: true,
      settings: {
        maxNumberOfValues: 1,
      },
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  city: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'city',
      type: FieldMetadataType.TEXT,
      label: 'City',
      description: "Contact's city",
      icon: 'IconMap',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  avatarUrl: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'avatarUrl',
      type: FieldMetadataType.TEXT,
      label: 'Avatar',
      description: "Contact's avatar",
      icon: 'IconFileUpload',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  position: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'position',
      type: FieldMetadataType.POSITION,
      label: 'Position',
      description: 'Person record Position',
      icon: 'IconHierarchy2',
      isSystem: true,
      isNullable: false,
      defaultValue: 0,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  createdBy: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'createdBy',
      type: FieldMetadataType.ACTOR,
      label: 'Created by',
      description: 'The creator of the record',
      icon: 'IconCreativeCommonsSa',
      isUIReadOnly: true,
      isNullable: false,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),

  // Relation fields
  company: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'company',
      type: FieldMetadataType.RELATION,
      label: 'Company',
      description: "Contact's company",
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  pointOfContactForOpportunities: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'pointOfContactForOpportunities',
      type: FieldMetadataType.RELATION,
      label: 'Opportunities',
      description:
        'List of opportunities for which that person is the point of contact',
      icon: 'IconTargetArrow',
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  taskTargets: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'taskTargets',
      type: FieldMetadataType.RELATION,
      label: 'Tasks',
      description: 'Tasks tied to the contact',
      icon: 'IconCheckbox',
      isUIReadOnly: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  noteTargets: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'noteTargets',
      type: FieldMetadataType.RELATION,
      label: 'Notes',
      description: 'Notes tied to the contact',
      icon: 'IconNotes',
      isUIReadOnly: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  favorites: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'favorites',
      type: FieldMetadataType.RELATION,
      label: 'Favorites',
      description: 'Favorites linked to the contact',
      icon: 'IconHeart',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  attachments: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'attachments',
      type: FieldMetadataType.RELATION,
      label: 'Attachments',
      description: 'Attachments linked to the contact.',
      icon: 'IconFileImport',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  messageParticipants: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'messageParticipants',
      type: FieldMetadataType.RELATION,
      label: 'Message Participants',
      description: 'Message Participants',
      icon: 'IconUserCircle',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  calendarEventParticipants: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'calendarEventParticipants',
      type: FieldMetadataType.RELATION,
      label: 'Calendar Event Participants',
      description: 'Calendar Event Participants',
      icon: 'IconCalendar',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  timelineActivities: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'timelineActivities',
      type: FieldMetadataType.RELATION,
      label: 'Events',
      description: 'Events linked to the person',
      icon: 'IconTimelineEvent',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
  searchVector: createStandardFieldFlatMetadata({
    options: {
      fieldName: 'searchVector',
      type: FieldMetadataType.TS_VECTOR,
      label: 'Search vector',
      description: 'Field used for full-text search',
      icon: 'IconUser',
      isSystem: true,
      isNullable: true,
      createdAt,
    },
    standardFieldMetadataIdByObjectAndFieldName,
  }),
});
