# Object Conversion Module

This module provides functionality to convert records from one object type to another in Twenty CRM. It allows users to define conversion templates with field mappings and rules, and then use these templates to convert records between different object types.

## Features

- Convert any object type to another object type
- Define and manage conversion templates
- Configure field mappings between source and target objects
- Set conversion rules and settings
- Support for default templates
- Drag-and-drop reordering of templates and field mappings

## Components

### ObjectConversionButton
A button component that appears on object detail pages when conversion is enabled for that object type. It allows users to convert the current record using available templates.

### ConversionSettingsPage
The main settings page for managing object conversion templates and settings. It provides a UI for:
- Creating new templates
- Editing existing templates
- Reordering templates
- Deleting templates

### TemplateForm
A form component for creating and editing conversion templates. It includes:
- Basic template information
- Target object selection
- Field mapping configuration
- Conversion settings
- Default template toggle

### TemplateList
Displays a list of available conversion templates with drag-and-drop reordering support.

### FieldMappingSection
A component for mapping fields between source and target objects, with drag-and-drop support for reordering mappings.

## Hooks

### useObjectFields
A hook for fetching available fields for a given object type.

```typescript
const { fieldOptions, loading, error } = useObjectFields(objectMetadataId);
```

### useAvailableObjects
A hook for fetching available object types that can be used as conversion targets.

```typescript
const { objectOptions, loading, error } = useAvailableObjects();
```

## Usage

### Enable Object Conversion

1. Navigate to the object's settings page
2. Enable conversion for the object type
3. Configure whether to show the convert button on records

### Create a Conversion Template

1. Go to the object's conversion settings
2. Click "Create Template"
3. Fill in the template details:
   - Name and description
   - Select target object type
   - Map fields between source and target objects
   - Configure conversion settings
   - Optionally set as default template

### Convert a Record

1. Open a record detail page
2. Click the "Convert" button
3. Select a conversion template
4. Review the conversion details
5. Click "Convert" to execute the conversion

### Example

```typescript
import { ObjectConversionButton } from '@/modules/object-conversion';

function ObjectDetailPage({ objectId, recordId }) {
  return (
    <div>
      <ObjectConversionButton
        objectId={objectId}
        recordId={recordId}
        onConversionSuccess={(convertedObjectId, convertedObjectType) => {
          // Handle successful conversion
        }}
      />
    </div>
  );
}
```

## Types

The module exports several TypeScript interfaces for type safety:

```typescript
interface FieldMappingRule {
  sourceField: string;
  targetField: string;
  transformationRule?: string;
}

interface ConversionSettings {
  keepOriginalObject: boolean;
  createRelations: boolean;
  markAsConverted: boolean;
}

interface TemplateMatchingRule {
  fieldName: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches';
  value: any;
}

interface ConversionTemplate {
  id: string;
  name: string;
  description?: string;
  sourceObjectMetadataId: string;
  targetObjectMetadataId: string;
  fieldMappingRules: FieldMappingRule[];
  conversionSettings: ConversionSettings;
  matchingRules?: TemplateMatchingRule[];
  isDefault: boolean;
  orderIndex: number;
}
