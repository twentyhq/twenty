# Widget Refactoring Guide

## Overview
This document outlines the refactoring patterns applied to GraphWidgetBarChart and GraphWidgetLineChart components in the Twenty codebase. These patterns should be followed when refactoring the remaining widget components.

## Key Refactoring Principles

### 1. One Export Per File
**Pattern**: Each file should have exactly ONE export.
```typescript
// ❌ Bad - multiple exports in one file
export const useChartData = () => {...}
export const useChartTooltip = () => {...}

// ✅ Good - one export per file
// useChartData.ts
export const useChartData = () => {...}

// useChartTooltip.ts
export const useChartTooltip = () => {...}
```

### 2. Folder Structure
Each widget should have its own folder at the same level as the shared `components` folder:

```
graph/
├── graphWidgetBarChart/  (camelCase folder name, at graph level)
│   ├── components/
│   │   ├── GraphWidgetBarChart.tsx  (main component)
│   │   └── BarChartEndLines.tsx     (sub-components)
│   ├── hooks/
│   │   ├── useBarChartData.ts
│   │   ├── useBarChartHandlers.ts
│   │   └── useBarChartTooltip.ts
│   ├── types/
│   │   ├── BarChartDataItem.ts
│   │   ├── BarChartSeries.ts
│   │   ├── BarChartConfig.ts
│   │   └── BarChartEnrichedKey.ts
│   └── utils/
│       ├── calculateBarChartEndLineCoordinates.ts
│       ├── getBarChartAxisBottomConfig.ts
│       ├── getBarChartAxisLeftConfig.ts
│       └── getBarChartColor.ts
├── graphWidgetLineChart/  (at same level as graphWidgetBarChart)
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── utils/
├── components/  (shared components like GraphWidgetLegend, GraphWidgetTooltip)
│   ├── GraphWidgetLegend.tsx
│   ├── GraphWidgetTooltip.tsx
│   ├── GraphWidgetRenderer.tsx
│   └── __stories__/
├── types/  (shared types)
└── utils/  (shared utils)
```

**Important**: 
- Widget folders are at the `graph/` level, NOT inside `components/`
- Main folder name is camelCase (e.g., `graphWidgetBarChart`, `graphWidgetLineChart`)
- Main component goes in a `components` subfolder within each widget folder
- Each widget has its own hooks, types, utils folders
- Shared components stay in the `graph/components/` folder

### 3. Import Paths Convention
**Pattern**: Use absolute imports with complete paths, NOT relative imports.
```typescript
// ❌ Bad - relative imports
import { BarChartEndLines } from '../components/BarChartEndLines';
import { useBarChartData } from '../hooks/useBarChartData';
import { type BarChartDataItem } from '../types/BarChartDataItem';

// ✅ Good - absolute imports with complete paths
import { BarChartEndLines } from '@/page-layout/widgets/graph/graphWidgetBarChart/components/BarChartEndLines';
import { useBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/hooks/useBarChartData';
import { type BarChartDataItem } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartDataItem';
```

### 4. Naming Conventions

#### Types
All types should have a consistent suffix matching their component:
```typescript
// BarChart types
export type BarChartDataItem = {...}
export type BarChartSeries = {...}
export type BarChartConfig = {...}
export type BarChartEnrichedKey = {...}

// LineChart types
export type LineChartDataPoint = {...}
export type LineChartSeries = {...}
export type LineChartEnrichedSeries = {...}
```

#### Hooks
Hooks should follow the pattern `use[Component][Purpose]`:
```typescript
// BarChart hooks
export const useBarChartData = () => {...}
export const useBarChartHandlers = () => {...}
export const useBarChartTooltip = () => {...}

// LineChart hooks
export const useLineChartData = () => {...}
export const useLineChartTooltip = () => {...}
```

#### Utils
Utils should follow the pattern `[action][Component][What]`:
```typescript
// BarChart utils
export const getBarChartAxisBottomConfig = () => {...}
export const getBarChartAxisLeftConfig = () => {...}
export const getBarChartColor = () => {...}
export const calculateBarChartEndLineCoordinates = () => {...}

// LineChart utils
export const getLineChartAxisBottomConfig = () => {...}
export const getLineChartAxisLeftConfig = () => {...}
export const handleLineChartPointClick = () => {...}
```

### 5. Extract Logic from Components

#### What to Extract:
1. **Data Transformation Logic** → hooks (e.g., `useBarChartData`)
2. **Event Handlers** → hooks (e.g., `useBarChartHandlers`)
3. **Tooltip Rendering Logic** → hooks (e.g., `useBarChartTooltip`)
4. **Configuration Builders** → utils (e.g., `getBarChartAxisBottomConfig`)
5. **Calculations** → utils (e.g., `calculateBarChartEndLineCoordinates`)
6. **Sub-components** → separate component files (e.g., `BarChartEndLines`)

#### What NOT to Extract:
- Component-specific props types (keep with component)
- Simple, one-line computations
- JSX that's tightly coupled with the component

### 6. Type Extraction Rules

#### Extract Shared Types
If a type is used in 2+ files, extract it to the types folder:
```typescript
// Used in multiple hooks and components
// types/BarChartDataItem.ts
export type BarChartDataItem = {
  [key: string]: string | number;
  to?: string;
};
```

#### Keep Component Props Local
Component props should stay with the component:
```typescript
// GraphWidgetBarChart.tsx
type GraphWidgetBarChartProps = {
  data: BarChartDataItem[];
  // ... other props
};

export const GraphWidgetBarChart = (props: GraphWidgetBarChartProps) => {...}
```

### 7. Memoization Strategy

**Use `useMemo` pragmatically** - only for expensive computations:
```typescript
// ✅ Good - expensive computation with many series
const enrichedSeries = useMemo((): LineChartEnrichedSeries[] => {
  return data.map((series, index) => {
    const colorScheme = getColorScheme(colorRegistry, series.color, index);
    // ... more complex transformations
  });
}, [data, colorRegistry, id, instanceId, enableArea]);

// ❌ Bad - simple object creation, no need for useMemo
const dataMap = useMemo(() => {
  const map: Record<string, LineChartSeries> = {};
  for (const series of data) {
    map[series.id] = series;
  }
  return map;
}, [data]);

// ✅ Better - just create it directly
const dataMap: Record<string, LineChartSeries> = {};
for (const series of data) {
  dataMap[series.id] = series;
}
```

### 8. JSX Elements vs Utils

**Never return JSX from utils** - use components instead:
```typescript
// ❌ Bad - util returning JSX
// utils/renderBarEndLines.ts
export const renderBarEndLines = (bars) => {
  return <g>{bars.map(...)}</g>;
};

// ✅ Good - proper React component
// components/BarChartEndLines.tsx
export const BarChartEndLines = ({ bars }: BarChartEndLinesProps) => {
  return <g>{bars.map(...)}</g>;
};
```

## Complete Refactoring Checklist

### For Each Widget Component:

1. **Create Folder Structure**
   - [ ] Create camelCase folder (e.g., `graphWidgetPieChart`)
   - [ ] Create subfolders: `components/`, `hooks/`, `types/`, `utils/`
   - [ ] Move main component to `components/` subfolder

2. **Extract Hooks**
   - [ ] Extract data transformation logic to `use[Component]Data`
   - [ ] Extract event handlers to `use[Component]Handlers`
   - [ ] Extract tooltip logic to `use[Component]Tooltip`
   - [ ] One hook per file

3. **Extract Types**
   - [ ] Identify types used in multiple files
   - [ ] Create separate type files with proper suffixes
   - [ ] Keep component props with component
   - [ ] One type export per file

4. **Extract Utils**
   - [ ] Extract configuration builders
   - [ ] Extract calculations
   - [ ] Name with component prefix (e.g., `getPieChartColor`)
   - [ ] One util function per file

5. **Update Imports**
   - [ ] Convert all relative imports to absolute imports
   - [ ] Use complete paths from `@/page-layout/widgets/graph/components/...`
   - [ ] Update story file imports
   - [ ] Update GraphWidgetRenderer imports

6. **Verify Naming Consistency**
   - [ ] All types have component suffix
   - [ ] All hooks follow `use[Component][Purpose]` pattern
   - [ ] All utils follow `[action][Component][What]` pattern

## Example: Applying to GraphWidgetPieChart

Based on the patterns above, GraphWidgetPieChart should be refactored as:

```
graph/
├── graphWidgetPieChart/  (at same level as other widget folders)
│   ├── components/
│   │   └── GraphWidgetPieChart.tsx
│   ├── hooks/
│   │   ├── usePieChartData.ts
│   │   ├── usePieChartHandlers.ts
│   │   └── usePieChartTooltip.ts
│   ├── types/
│   │   ├── PieChartDataItem.ts
│   │   └── PieChartSlice.ts
│   └── utils/
│       ├── getPieChartColor.ts
│       └── calculatePieChartPercentages.ts
├── components/  (existing shared components folder)
└── ...
```

With imports like:
```typescript
import { usePieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartData';
import { type PieChartDataItem } from '@/page-layout/widgets/graph/graphWidgetPieChart/types/PieChartDataItem';
```

## Common Pitfalls to Avoid

1. **Don't over-extract** - Keep simple logic in the component
2. **Don't use `any` type** - Always provide proper types
3. **Don't create barrel exports** - Twenty uses one export per file
4. **Don't use default exports** - Always use named exports
5. **Don't put JSX in utils** - Use components for JSX
6. **Don't forget to update story imports** when moving components
7. **Don't use relative imports** - Always use absolute imports with complete paths

## Testing After Refactoring

After completing refactoring for each widget:
1. Run `npx nx lint twenty-front --fix` to fix formatting
2. Run `npx nx typecheck twenty-front` to check types
3. Verify the widget renders correctly in Storybook
4. Check that all interactive features still work

## Files Already Refactored

✅ **GraphWidgetBarChart** - Complete refactoring with:
- Folder renamed to `graphWidgetBarChart`
- 3 hooks extracted
- 4 types extracted  
- 4 utils extracted
- All imports updated to absolute paths

✅ **GraphWidgetLineChart** - Complete refactoring with:
- Folder renamed to `graphWidgetLineChart`
- 2 hooks extracted
- 3 types extracted
- 3 utils extracted
- All imports updated to absolute paths

## Remaining Widgets to Refactor

- [ ] GraphWidgetPieChart
- [ ] GraphWidgetGaugeChart
- [ ] GraphWidgetNumberChart

Follow the exact same patterns established in the BarChart and LineChart refactoring.