import { Person } from '@/people/types/Person';
import { Entity } from '@/ui/input/relation-picker/types/EntityTypeForSelect';
import {
  FieldDateMetadata,
  FieldMetadata,
  FieldNumberMetadata,
  FieldProbabilityMetadata,
  FieldRelationMetadata,
} from '@/ui/object/field/types/FieldMetadata';
import { ColumnDefinition } from '@/ui/object/record-table/types/ColumnDefinition';

export const pipelineAvailableFieldDefinitions: ColumnDefinition<FieldMetadata>[] =
  [
    {
      fieldMetadataId: 'closeDate',
      label: 'Close Date',
      iconName: 'IconCalendarEvent',
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
      iconName: 'IconCurrencyDollar',
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
      iconName: 'IconProgressCheck',
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
      iconName: 'IconUser',
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
          name: dataObject?.name.firstName + ' ' + dataObject?.name.lastName,
          pictureUrl: dataObject?.avatarUrl ?? undefined,
          avatarType: 'rounded',
        };
      },
    } satisfies ColumnDefinition<FieldRelationMetadata>,
  ];
