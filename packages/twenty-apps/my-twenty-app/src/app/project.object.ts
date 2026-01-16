import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { defineObject, FieldType, RelationType } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: 'a1b2c3d4-5678-4abc-9def-111111111111',
  nameSingular: 'project',
  namePlural: 'projects',
  labelSingular: 'Project',
  labelPlural: 'Projects',
  icon: 'IconBriefcase',
  fields: [
    {
      universalIdentifier: 'a1b2c3d4-5678-4abc-9def-111111111115',
      name: 'company',
      label: 'Company',
      description: 'Client of the project',
      icon: 'IconBuildingSkyscraper',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectUniversalIdentifier: STANDARD_OBJECT_IDS.company,
      targetFieldLabel: 'Projects',
      targetFieldIcon: 'IconBriefcase',
      type: FieldType.RELATION,
    },
    {
      universalIdentifier: 'a1b2c3d4-5678-4abc-9def-111111111113',
      type: FieldType.TEXT,
      name: 'description',
      label: 'Description',
      description: 'Project description',
      icon: 'IconNotes',
    },
    {
      universalIdentifier: 'a1b2c3d4-5678-4abc-9def-111111111114',
      type: FieldType.NUMBER,
      name: 'discount',
      label: 'Discount',
      description: 'Discount percentage',
      icon: 'IconPercentage',
    },
  ],
});
