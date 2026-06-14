import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const OPPORTUNITY_DESIGN_DOC_STATUS_FIELD_ID = 'cc6b8a59-f860-493f-8b9a-f138c078fbf1';

export default defineField({
  universalIdentifier: OPPORTUNITY_DESIGN_DOC_STATUS_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'designDocStatus',
  label: 'Design Doc Status',
  defaultValue: "'DRAFT'",
  options: [
    { id: '1901c790-22af-4149-a792-09374d67acfd', value: 'DRAFT', label: 'Draft', position: 0, color: 'gray' },
    { id: '02cbe191-cc96-4b42-9d8e-f85cd47bed24', value: 'DONE', label: 'Done', position: 1, color: 'green' },
    { id: '943e1389-12cd-4605-8066-db27ba68a50a', value: 'SHARED_WITH_PARTNER', label: 'Shared with Partner', position: 2, color: 'blue' },
  ],
});
