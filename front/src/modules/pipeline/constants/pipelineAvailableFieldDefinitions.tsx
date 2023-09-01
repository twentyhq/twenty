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
      icon: <IconCalendarEvent />,
      metadata: {
        type: 'date',
        fieldName: 'closeDate',
      },
      isVisible: true,
    } satisfies ViewFieldDefinition<ViewFieldDateMetadata>,
    {
      key: 'amount',
      name: 'Amount',
      icon: <IconCurrencyDollar />,
      metadata: {
        type: 'number',
        fieldName: 'amount',
      },
      isVisible: true,
    } satisfies ViewFieldDefinition<ViewFieldNumberMetadata>,
    {
      key: 'probability',
      name: 'Probability',
      icon: <IconProgressCheck />,
      metadata: {
        type: 'probability',
        fieldName: 'probability',
      },
      isVisible: true,
    } satisfies ViewFieldDefinition<ViewFieldProbabilityMetadata>,
    {
      key: 'pointOfContact',
      name: 'Point of Contact',
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
