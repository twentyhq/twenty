import {
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldProbabilityMetadata,
  FieldRelationMetadata,
} from '@/ui/field/types/FieldMetadata';
import {
  IconCalendarEvent,
  IconCurrencyDollar,
  IconProgressCheck,
  IconUser,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import { ViewFieldDefinition } from '@/views/types/ViewFieldDefinition';

export const pipelineAvailableFieldDefinitions: ViewFieldDefinition<FieldMetadata>[] =
  [
    {
      key: 'closeDate',
      name: 'Close Date',
      Icon: IconCalendarEvent,
      index: 0,
      type: 'date',
      metadata: {
        fieldName: 'closeDate',
      },
      isVisible: true,
    } as ViewFieldDefinition<FieldDateMetadata>,
    {
      key: 'amount',
      name: 'Amount',
      Icon: IconCurrencyDollar,
      index: 1,
      type: 'number',
      metadata: {
        fieldName: 'amount',
      },
      isVisible: true,
    } as ViewFieldDefinition<FieldNumberMetadata>,
    {
      key: 'probability',
      name: 'Probability',
      Icon: IconProgressCheck,
      index: 2,
      type: 'probability',
      metadata: {
        fieldName: 'probability',
      },
      isVisible: true,
    } as ViewFieldDefinition<FieldProbabilityMetadata>,
    {
      key: 'pointOfContact',
      name: 'Point of Contact',
      Icon: IconUser,
      index: 3,
      type: 'relation',
      metadata: {
        fieldName: 'pointOfContact',
        relationType: Entity.Person,
        useEditButton: true,
      },
      isVisible: true,
    } as ViewFieldDefinition<FieldRelationMetadata>,
  ];
