// Components
export * from './components';

// Hooks
export * from './hooks';

// GraphQL Operations
export {
  GET_CONVERSION_TEMPLATES,
  GET_OBJECT_CONVERSION_SETTINGS,
  GET_AVAILABLE_TEMPLATES_FOR_OBJECT,
} from './graphql/queries';

export {
  CREATE_CONVERSION_TEMPLATE,
  UPDATE_CONVERSION_TEMPLATE,
  DELETE_CONVERSION_TEMPLATE,
  REORDER_CONVERSION_TEMPLATES,
  UPDATE_OBJECT_CONVERSION_SETTINGS,
  CONVERT_OBJECT,
} from './graphql/mutations';

// Types
export interface FieldMappingRule {
  sourceField: string;
  targetField: string;
  transformationRule?: string;
}

export interface ConversionSettings {
  keepOriginalObject: boolean;
  createRelations: boolean;
  markAsConverted: boolean;
}

export interface TemplateMatchingRule {
  fieldName: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'matches';
  value: any;
}

export interface ConversionTemplate {
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

export interface ObjectConversionSettings {
  id: string;
  objectMetadataId: string;
  isConversionSource: boolean;
  showConvertButton: boolean;
}

export interface ConversionResult {
  success: boolean;
  convertedObjectId: string;
  convertedObjectType: string;
}
