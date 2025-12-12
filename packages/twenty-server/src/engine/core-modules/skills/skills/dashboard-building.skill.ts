import { type SkillDefinition } from 'src/engine/core-modules/skills/skill-definition.type';

export const DASHBOARD_BUILDING_SKILL: SkillDefinition = {
  name: 'dashboard-building',
  label: 'Dashboard Building',
  description: 'Creating and managing dashboards with widgets and layouts',
  content: `# Dashboard Building Skill

You help users create and manage dashboards with widgets.

## CRITICAL: Creating GRAPH Widgets

Before creating any GRAPH widget, you MUST:
1. Use list_object_metadata_items to get the objectMetadataId (e.g., for "opportunity", "company")
2. From the response, get the field IDs you need (aggregateFieldMetadataId, primaryAxisGroupByFieldMetadataId)

GRAPH widgets require real UUIDs from the workspace metadata, NOT made-up values.

## Widget Configuration

### GRAPH - AGGREGATE (KPI numbers)
Shows a single aggregated value (count, sum, average).
Required:
- objectMetadataId: UUID of the object (e.g., opportunity)
- configuration.graphType: "AGGREGATE"
- configuration.aggregateFieldMetadataId: UUID of field to aggregate
- configuration.aggregateOperation: "COUNT", "SUM", "AVG", "MIN", "MAX"

### GRAPH - BAR/LINE Charts
Shows data grouped by a dimension.
Required:
- objectMetadataId: UUID of the object
- configuration.graphType: "VERTICAL_BAR", "HORIZONTAL_BAR", or "LINE"
- configuration.aggregateFieldMetadataId: field to aggregate
- configuration.aggregateOperation: aggregation type
- configuration.primaryAxisGroupByFieldMetadataId: field to group by (x-axis)

### GRAPH - PIE Charts
Shows data distribution as slices.
Required:
- objectMetadataId: UUID of the object
- configuration.graphType: "PIE"
- configuration.aggregateFieldMetadataId: field to aggregate
- configuration.aggregateOperation: aggregation type
- configuration.groupByFieldMetadataId: field to slice by

### IFRAME
Embeds external content:
- configuration.url: "https://..."

### STANDALONE_RICH_TEXT
Text content widget:
- configuration.body: "Your text here"

## Grid System

- 12 columns (0-11)
- KPI widgets: rowSpan 2-4, columnSpan 3-4
- Charts: rowSpan 6-8, columnSpan 6-12
- Common layouts:
  - 4 KPIs in a row: each { columnSpan: 3 }
  - 2 charts side by side: each { columnSpan: 6 }
  - Full width chart: { column: 0, columnSpan: 12 }

## Workflow

1. Ask user what data they want to visualize
2. Load list_object_metadata_items to discover available objects and fields
3. Create dashboard with appropriate widgets using real field IDs
4. Use get_dashboard to verify creation

## Best Practices

- Place KPIs at the top (row 0)
- Group related charts together
- Use consistent heights within rows
- Start simple, add complexity as needed`,
};
