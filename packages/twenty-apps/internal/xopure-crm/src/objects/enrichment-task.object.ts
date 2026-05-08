import { defineObject, FieldType } from 'twenty-sdk/define';

export const ENRICHMENT_TASK_OBJECT_ID = '628fe55b-6d9f-437b-b2ea-1d52dd5dc99d';
export const ENRICHMENT_TASK_NAME_FIELD_ID = '92e3e392-dc23-435a-bbd5-7c2f583ad6a7';

export default defineObject({
  universalIdentifier: ENRICHMENT_TASK_OBJECT_ID,
  nameSingular: 'xopureEnrichmentTask',
  namePlural: 'xopureEnrichmentTasks',
  labelSingular: 'Enrichment Task',
  labelPlural: 'Enrichment Tasks',
  description: 'Research and contact enrichment work queue for agents and operators.',
  icon: 'IconUserSearch',
  labelIdentifierFieldMetadataUniversalIdentifier: ENRICHMENT_TASK_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: ENRICHMENT_TASK_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconUserSearch' },
    {
      universalIdentifier: '44b57027-7b19-461f-b7ea-d610afaa81d4',
      type: FieldType.SELECT,
      name: 'targetType',
      label: 'Target type',
      icon: 'IconTarget',
      defaultValue: "'RETAIL_PROSPECT'",
      options: [
        { id: 'd1c0b258-1be6-4c59-8520-a9f6a9dbaf32', value: 'CUSTOMER', label: 'Customer', position: 0, color: 'green' },
        { id: '1d35fc76-1495-4384-944d-c0619e28cb97', value: 'AMBASSADOR', label: 'Ambassador', position: 1, color: 'blue' },
        { id: '463549f8-977d-46be-bcc7-ac2d16827edb', value: 'RETAIL_PROSPECT', label: 'Retail prospect', position: 2, color: 'yellow' },
        { id: 'e1e37f27-93a5-4fb2-b654-e6c302cf8c1a', value: 'INFLUENCER_PROSPECT', label: 'Influencer prospect', position: 3, color: 'purple' },
      ],
    },
    { universalIdentifier: '69bb6efd-33c3-4cae-9f49-795cf6f25141', type: FieldType.TEXT, name: 'targetExternalId', label: 'Target external ID', icon: 'IconLink' },
    {
      universalIdentifier: '78f45826-9a9b-4b8d-b9a4-0114a71a6463',
      type: FieldType.SELECT,
      name: 'status',
      label: 'Status',
      icon: 'IconProgressCheck',
      defaultValue: "'QUEUED'",
      options: [
        { id: '6cfcdd0b-3577-407d-8fc1-662e2013af78', value: 'QUEUED', label: 'Queued', position: 0, color: 'gray' },
        { id: 'bf494cb8-a2da-4910-b5c5-c4df1f6df394', value: 'RUNNING', label: 'Running', position: 1, color: 'blue' },
        { id: '898f3d92-649d-450e-91d4-f11778469c49', value: 'DONE', label: 'Done', position: 2, color: 'green' },
        { id: '787b0374-4190-4c34-9f66-154497a59ca0', value: 'FAILED', label: 'Failed', position: 3, color: 'red' },
      ],
    },
    { universalIdentifier: '83b0a0eb-b47e-43d8-a601-c808ec0dc257', type: FieldType.TEXT, name: 'requestedDataPoints', label: 'Requested data points', icon: 'IconListSearch' },
    { universalIdentifier: '8bd6ea76-e8f5-4716-aa23-94e3f16d7d96', type: FieldType.TEXT, name: 'resultSummary', label: 'Result summary', icon: 'IconNotes' },
    { universalIdentifier: 'a1c7c0af-3f35-439d-b79f-280a9d79163f', type: FieldType.DATE_TIME, name: 'completedAt', label: 'Completed at', icon: 'IconCalendarCheck', isNullable: true, defaultValue: null },
  ],
});
