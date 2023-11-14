import {
  IconCalendarEvent,
  IconCurrencyDollar,
  IconProgressCheck,
  IconUser,
} from '@/ui/display/icon';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldProbabilityMetadata,
  FieldRelationMetadata,
} from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';
import { Person } from '~/generated/graphql';

export const pipelineAvailableFieldDefinitions: ColumnDefinition<FieldMetadata>[] =
  [
    {
      fieldMetadataId: 'closeDate',
      label: 'Close Date',
      Icon: IconCalendarEvent,
      position: 0,
      type: 'DATE',
      metadata: {
        fieldName: 'closeDate',
      },
      size: 0,
      isVisible: true,
      infoTooltipContent:
        'Specified date by which an opportunity must be completed.',
    } satisfies ColumnDefinition<FieldDateMetadata>,
    {
      fieldMetadataId: 'amount',
      label: 'Amount',
      Icon: IconCurrencyDollar,
      position: 1,
      type: 'NUMBER',
      metadata: {
        fieldName: 'amount',
        placeHolder: '0',
      },
      size: 0,
      isVisible: true,
      infoTooltipContent: 'Potential monetary value of a business opportunity.',
    } satisfies ColumnDefinition<FieldNumberMetadata>,
    {
      fieldMetadataId: 'probability',
      label: 'Probability',
      Icon: IconProgressCheck,
      position: 2,
      type: 'PROBABILITY',
      metadata: {
        fieldName: 'probability',
      },
      size: 0,
      isVisible: true,
      infoTooltipContent:
        "Level of certainty in the lead's potential to convert into a success.",
    } satisfies ColumnDefinition<FieldProbabilityMetadata>,
    {
      fieldMetadataId: 'pointOfContact',
      label: 'Point of Contact',
      Icon: IconUser,
      position: 3,
      type: 'RELATION',
      metadata: {
        fieldName: 'pointOfContact',
        relationType: Entity.Person,
        useEditButton: true,
      },
      size: 0,
      isVisible: true,
      infoTooltipContent: 'Primary contact within the company.',
      entityChipDisplayMapper: (dataObject: Person) => {
        return {
          name: dataObject?.displayName,
          pictureUrl: dataObject?.avatarUrl ?? undefined,
          avatarType: 'rounded',
        };
      },
    } satisfies ColumnDefinition<FieldRelationMetadata>,
  ];
