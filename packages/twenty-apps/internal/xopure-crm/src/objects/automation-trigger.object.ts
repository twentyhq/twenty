import { defineObject, FieldType } from 'twenty-sdk/define';

export const AUTOMATION_TRIGGER_OBJECT_ID = 'b2ba24d8-1f1e-4bd9-980d-60548c91de6b';
export const AUTOMATION_TRIGGER_NAME_FIELD_ID = 'ea5fc0fd-a894-4400-a19f-57cf3b3b6247';

export default defineObject({
  universalIdentifier: AUTOMATION_TRIGGER_OBJECT_ID,
  nameSingular: 'xopureAutomationTrigger',
  namePlural: 'xopureAutomationTriggers',
  labelSingular: 'Automation Trigger',
  labelPlural: 'Automation Triggers',
  description: 'Configuration records that describe CRM automation triggers and attached sequences or agents.',
  icon: 'IconAutomation',
  labelIdentifierFieldMetadataUniversalIdentifier: AUTOMATION_TRIGGER_NAME_FIELD_ID,
  fields: [
    { universalIdentifier: AUTOMATION_TRIGGER_NAME_FIELD_ID, type: FieldType.TEXT, name: 'name', label: 'Name', icon: 'IconBolt' },
    {
      universalIdentifier: 'f311619f-f092-4cf2-98f6-71cd67d231b0',
      type: FieldType.SELECT,
      name: 'triggerType',
      label: 'Trigger type',
      icon: 'IconPlugConnected',
      defaultValue: "'RECORD_EVENT'",
      options: [
        { id: '96f2a234-10aa-45fe-a05d-ddc9ea9a1dd9', value: 'RECORD_EVENT', label: 'Record event', position: 0, color: 'blue' },
        { id: '273df761-cfea-4034-bdc4-502407284c93', value: 'SCHEDULE', label: 'Schedule', position: 1, color: 'purple' },
        { id: '32de1024-7549-4421-8040-30aff1aa435e', value: 'WEBHOOK', label: 'Webhook', position: 2, color: 'yellow' },
        { id: 'ea6ddc1f-42c6-4917-b8a7-b5ec52ad723e', value: 'MANUAL', label: 'Manual', position: 3, color: 'gray' },
      ],
    },
    { universalIdentifier: '725539e8-8bdf-46b7-8116-d05f61021ab0', type: FieldType.TEXT, name: 'targetObject', label: 'Target object', icon: 'IconTable' },
    { universalIdentifier: 'de1f2445-539d-487e-90e7-c039003625fb', type: FieldType.TEXT, name: 'conditionSummary', label: 'Condition summary', icon: 'IconFilter' },
    { universalIdentifier: 'c27910ec-efc7-4860-a48f-374e67c07687', type: FieldType.TEXT, name: 'attachedSequence', label: 'Attached sequence', icon: 'IconMailForward' },
    { universalIdentifier: '667537f8-cdbe-4523-a735-edc48848acec', type: FieldType.TEXT, name: 'attachedAgent', label: 'Attached agent', icon: 'IconRobot' },
    { universalIdentifier: '440488d6-1c21-430e-95c2-6f03b80783f4', type: FieldType.BOOLEAN, name: 'isActive', label: 'Active', icon: 'IconPower', defaultValue: false },
  ],
});
