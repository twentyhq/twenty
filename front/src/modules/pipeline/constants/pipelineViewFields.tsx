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
    label: 'Close Date',
    icon: <IconCalendarEvent />,
    metadata: {
      type: 'date',
      fieldName: 'closeDate',
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldDateMetadata>,
  {
    id: 'amount',
    label: 'Amount',
    icon: <IconCurrencyDollar />,
    metadata: {
      type: 'number',
      fieldName: 'amount',
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldNumberMetadata>,
  {
    id: 'probability',
    label: 'Probability',
    icon: <IconProgressCheck />,
    metadata: {
      type: 'probability',
      fieldName: 'probability',
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldProbabilityMetadata>,
  {
    id: 'pointOfContact',
    label: 'Point of Contact',
    icon: <IconUser />,
    metadata: {
      type: 'relation',
      fieldName: 'pointOfContact',
      relationType: Entity.Person,
      useEditButton: true,
    },
    isVisible: true,
  } satisfies ViewFieldDefinition<ViewFieldRelationMetadata>,
];
