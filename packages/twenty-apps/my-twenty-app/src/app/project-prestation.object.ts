import { defineObject, FieldType, RelationType } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: 'f5a6b7c8-9abc-4def-0123-666666666661',
  nameSingular: 'projectPrestation',
  namePlural: 'projectPrestations',
  labelSingular: 'Project Prestation',
  labelPlural: 'Project Prestations',
  icon: 'IconLink',
  fields: [
    {
      universalIdentifier: 'f5a6b7c8-9abc-4def-0123-666666666663',
      name: 'project',
      label: 'Project',
      description: 'The project this prestation belongs to',
      icon: 'IconBriefcase',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectUniversalIdentifier: 'a1b2c3d4-5678-4abc-9def-111111111111',
      targetFieldLabel: 'Project Prestations',
      targetFieldIcon: 'IconLink',
      type: FieldType.RELATION,
    },
    {
      universalIdentifier: 'f5a6b7c8-9abc-4def-0123-666666666664',
      name: 'prestation',
      label: 'Prestation',
      description: 'The prestation linked to this project',
      icon: 'IconReceipt',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectUniversalIdentifier: 'b2c3d4e5-6789-4bcd-aef0-222222222221',
      targetFieldLabel: 'Project Prestations',
      targetFieldIcon: 'IconLink',
      type: FieldType.RELATION,
    },
  ],
});
