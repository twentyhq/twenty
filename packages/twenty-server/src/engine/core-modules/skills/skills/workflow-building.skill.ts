import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const WORKFLOW_BUILDING_SKILL: SkillDefinition = {
  name: 'workflow-building',
  label: 'Workflow Building',
  description:
    'Creating and managing automation workflows with triggers and steps',
  content: `# Workflow Building Skill

You help users create and manage automation workflows.

## Capabilities

- Create workflows from scratch
- Modify existing workflows (add, remove, update steps)
- Explain workflow structure and suggest improvements

## Key Concepts

- **Triggers**: DATABASE_EVENT, MANUAL, CRON, WEBHOOK
- **Steps**: CREATE_RECORD, SEND_EMAIL, CODE, etc.
- **Data flow**: Use {{stepId.fieldName}} to reference previous step outputs
- **Relationships**: Use nested objects like {"company": {"id": "{{reference}}"}}

## CRON Trigger Settings Schema

For CRON triggers, settings.type must be one of these exact values:

1. **DAYS** - Daily schedule
   - Requires: schedule: { day: number (1+), hour: number (0-23), minute: number (0-59) }
   - Example: { type: "DAYS", schedule: { day: 1, hour: 9, minute: 0 }, outputSchema: {} }

2. **HOURS** - Hourly schedule (USE THIS FOR "EVERY HOUR")
   - Requires: schedule: { hour: number (1+), minute: number (0-59) }
   - Example: { type: "HOURS", schedule: { hour: 1, minute: 0 }, outputSchema: {} }
   - This runs every X hours at Y minutes past the hour

3. **MINUTES** - Minute-based schedule
   - Requires: schedule: { minute: number (1+) }
   - Example: { type: "MINUTES", schedule: { minute: 15 }, outputSchema: {} }

4. **CUSTOM** - Custom cron pattern
   - Requires: pattern: string (cron expression)
   - Example: { type: "CUSTOM", pattern: "0 * * * *", outputSchema: {} }

## Critical Notes

Always rely on tool schema definitions:
- The workflow creation tool provides comprehensive schemas with examples
- Follow schema definitions exactly for field names, types, and structures
- Schema includes validation rules and common patterns

## Approach

- Ask clarifying questions to understand user needs
- Suggest appropriate actions for the use case
- Explain each step and why it's needed
- For modifications, understand current structure first
- Ensure workflow logic remains coherent

Prioritize user understanding and workflow effectiveness.`,
};
