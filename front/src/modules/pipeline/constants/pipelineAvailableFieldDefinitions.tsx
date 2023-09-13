import {
  ViewFieldDateMetadata,
  ViewFieldDefinition,
  ViewFieldMetadata,
  ViewFieldNumberMetadata,
  ViewFieldProbabilityMetadata,
  ViewFieldRelationMetadata,
} from '@/ui/editable-field/types/ViewField';
import {
  IconCalendarEvent,
  IconCurrencyDollar,
  IconProgressCheck,
  IconUser,
} from '@/ui/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';

export const pipelineAvailableFieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[] =
  [
    {
      key: 'closeDate',
      name: 'Close Date',
      Icon: IconCalendarEvent,
      index: 0,
      metadata: {
        type: 'date',
        fieldName: 'closeDate',
      },
      isVisible: true,
    } satisfies ViewFieldDefinition<ViewFieldDateMetadata>,
    {
      key: 'amount',
      name: 'Amount',
      Icon: IconCurrencyDollar,
      index: 1,
      metadata: {
        type: 'number',
        fieldName: 'amount',
      },
      isVisible: true,
    } satisfies ViewFieldDefinition<ViewFieldNumberMetadata>,
    {
      key: 'probability',
      name: 'Probability',
      Icon: IconProgressCheck,
      index: 2,
      metadata: {
        type: 'probability',
        fieldName: 'probability',
      },
      isVisible: true,
    } satisfies ViewFieldDefinition<ViewFieldProbabilityMetadata>,
    {
      key: 'pointOfContact',
      name: 'Point of Contact',
      Icon: IconUser,
      index: 3,
      metadata: {
        type: 'relation',
        fieldName: 'pointOfContact',
        relationType: Entity.Person,
        useEditButton: true,
      },
      isVisible: true,
    } satisfies ViewFieldDefinition<ViewFieldRelationMetadata>,
  ];
