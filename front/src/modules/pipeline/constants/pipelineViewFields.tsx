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

export const pipelineViewFields: ViewFieldDefinition<ViewFieldMetadata>[] = [
  {
    id: 'closeDate',
    columnLabel: 'Close Date',
    columnIcon: <IconCalendarEvent />,
    columnSize: 150,
    columnOrder: 4,
    metadata: {
      type: 'date',
      fieldName: 'closeDate',
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldDateMetadata>,
  {
    id: 'amount',
    columnLabel: 'Amount',
    columnIcon: <IconCurrencyDollar />,
    columnSize: 150,
    columnOrder: 4,
    metadata: {
      type: 'number',
      fieldName: 'amount',
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldNumberMetadata>,
  {
    id: 'probability',
    columnLabel: 'Probability',
    columnIcon: <IconProgressCheck />,
    columnSize: 150,
    columnOrder: 4,
    metadata: {
      type: 'probability',
      fieldName: 'probability',
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldProbabilityMetadata>,
  {
    id: 'pointOfContact',
    columnLabel: 'Point of Contact',
    columnIcon: <IconUser />,
    columnSize: 150,
    columnOrder: 4,
    metadata: {
      type: 'relation',
      fieldName: 'pointOfContact',
      relationType: Entity.Person,
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldRelationMetadata>,
];
