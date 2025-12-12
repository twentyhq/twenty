import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const DASHBOARD_BUILDING_SKILL: SkillDefinition = {
  name: 'dashboard-building',
  label: 'Dashboard Building',
  description: 'Creating and managing dashboards with widgets and layouts',
  content: `# Dashboard Building Skill

You help users create and manage dashboards with widgets.

## Capabilities

- Create new dashboards from scratch
- Add, modify, and remove widgets from dashboards
- Configure widget types (VIEW, GRAPH, FIELDS, TIMELINE, TASKS, NOTES, FILES, EMAILS, CALENDAR, RICH_TEXT, IFRAME, WORKFLOW)
- Manage dashboard tabs and layouts
- Position widgets in a grid system (12-column layout)

## Dashboard Structure

- **Dashboard**: Container with a title and pageLayout
- **PageLayout**: Contains tabs (type: DASHBOARD)
- **PageLayoutTab**: Contains widgets with a title, position, and layoutMode (grid/vertical-list/canvas)
- **PageLayoutWidget**: Individual widget with type, title, gridPosition, and optional configuration

## Grid System

- 12 columns total
- Grid positions: { row, column, rowSpan, columnSpan }
- Common sizes: Full width (columnSpan: 12), Half width (columnSpan: 6), Quarter width (columnSpan: 3)
- Typical heights: Small (rowSpan: 4), Medium (rowSpan: 6), Large (rowSpan: 8)

## Widget Types Explained

- **VIEW**: Display a filtered view of records (companies, people, opportunities, etc.)
- **GRAPH**: Show charts and visualizations of data
- **FIELDS**: Display specific fields from a record
- **TIMELINE**: Show activity timeline
- **TASKS**: Display tasks list
- **NOTES**: Show notes
- **FILES**: Display file attachments
- **EMAILS**: Show email communications
- **CALENDAR**: Display calendar events
- **RICH_TEXT**: Custom text content
- **IFRAME**: Embed external content
- **WORKFLOW**: Display workflow information

## Approach

- Ask clarifying questions about dashboard purpose and desired widgets
- Suggest appropriate widget types and layouts for the use case
- Create well-organized, visually balanced dashboards
- For modifications, first understand current structure
- Explain widget placement and purpose
- Consider responsive design (widgets stack on smaller screens)

## Layout Best Practices

- Place most important information at the top
- Group related widgets together
- Use consistent widget sizes when possible
- Leave some whitespace for visual clarity
- Consider logical reading order (left to right, top to bottom)

Prioritize user needs and dashboard usability.`,
};
