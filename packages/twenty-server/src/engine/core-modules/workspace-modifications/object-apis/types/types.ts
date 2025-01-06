

export interface SelectOption {
    color: string;
    label: string;
    position: number;
    value: string;
}

export interface BaseField {
    description?: string;
    icon?: string;
    label: string;
    name: string;
    objectMetadataId: string;
    type: FieldType;
    defaultValue?: any;
}

export interface TextField extends BaseField {
    type: 'TEXT';
}

export interface NumberField extends BaseField {
    type: 'NUMBER';
}

export interface BooleanField extends BaseField {
    type: 'BOOLEAN';
    defaultValue?: boolean;
}

export interface DateTimeField extends BaseField {
    type: 'DATE_TIME';
}

export interface SelectField extends BaseField {
    type: 'SELECT';
    options: SelectOption[];
}

export interface LinkField extends BaseField {
    type: 'LINKS';
}

export interface RawJsonField extends BaseField {
    type: 'RAW_JSON';
}


export interface ObjectMetadata {
    id?: string;
    nameSingular?: string;
    labelPlural?: string;
    labelSingular?: string;
    namePlural?: string;
    description?: string;
    icon?: string;
    fields?: {
        edges?: Array<{
            node?: FieldMetadata;
        }>;
    };


}

export interface ObjectCreationInput {
    object?: {
        description?: string;
        icon?: string;
        labelPlural?: string;
        labelSingular?: string;
        nameSingular?: string;
        namePlural?: string;
    };
}


export interface CreateOneFieldMetadataInput {
    field: {
        type: string;
        name: string;
        label: string;
        description?: string;
        icon?: string;
        objectMetadataId: string;
        options?: Array<{
            color: string;
            label: string;
            position: number;
            value: string;
        }>;
    }
}
export interface FieldMetadata {
    type: string;
    name: string;
    label: string;
    description?: string;
    icon?: string;
    objectMetadataId: string;
    options?: Array<{
        color: string;
        label: string;
        position: number;
        value: string;
    }>;
}
export interface CreateOneObjectInput {
    object: {
        description: string;
        icon: string;
        labelPlural: string;
        labelSingular: string;
        nameSingular: string;
        namePlural: string;
    }
}

export interface CreateOneRelationInput {
    relation: {
        fromObjectMetadataId: string;
        toObjectMetadataId: string;
        relationType: "ONE_TO_MANY" | "ONE_TO_ONE" | "MANY_TO_ONE" | "MANY_TO_MANY";
        fromFieldMetadataId?: string;
        toFieldMetadataId?: string;
        fromName?: string;
        toName?: string;
        fromDescription?: string | null;
        toDescription?: string;
        fromLabel?: string;
        toLabel?: string;
        fromIcon?: string;
        toIcon?: string;
    }
}


export interface RelationCreationInput {
    relation?: {
        fromDescription?: string | null;
        fromIcon?: string;
        fromLabel?: string;
        fromName?: string;
        fromObjectMetadataId?: string;
        relationType?: string;
        toObjectMetadataId?: string;
        toDescription?: string;
        toLabel?: string;
        toName?: string;
        toIcon?: string;
    };
}

export interface FieldCreationInput {
    field?: {
        description?: string;
        icon?: string;
        label?: string;
        name?: string;
        objectMetadataId?: string;
        type?: string;
        options?: Array<{
            color?: string;
            label?: string;
            position?: number;
            value?: string;
        }>;
        defaultValue?: any;
    };
}

export interface QueryResponse<T> {
    data?: {
        objects?: {
            edges?: Array<{
                node?: T;
            }>;
        };
    };
}

export interface Relation {
    fromDescription?: string | null;
    fromIcon?: string;
    fromLabel?: string;
    fromName?: string;
    fromObjectMetadataId?: string;
    relationType?: "ONE_TO_MANY" | "ONE_TO_ONE" | "MANY_TO_ONE" | "MANY_TO_MANY";
    toObjectMetadataId?: string;
    toDescription?: string;
    toLabel?: string;
    toIcon?: string;
    toName?: string;
    fromFieldMetadataId?: string;
    toFieldMetadataId?: string;

}

export interface RelationInput {
    relation?: Relation;
}

export type FieldType = "SELECT" | "DATE_TIME" | "TEXT" | "NUMBER" | "BOOLEAN" | "LINKS" | "RAW_JSON";

export interface FieldOption {
    color?: string;
    label?: string;
    position?: number;
    value?: string;
}

export interface Field {
    description?: string;
    icon?: string;
    label?: string;
    name?: string;
    objectMetadataId?: string;
    type?: FieldType;
    options?: FieldOption[];
    defaultValue?: any;
}

export interface FieldInput {
    field?: Field;
}



// AI Model Types
export interface AIModel {
    name: string;
    country: string;
    language: string;
}

export interface AIInterview {
    name: string;
    aIModelId: string;
    jobId: string;
    introduction?: string;
    instructions?: string;
}

// Add country and language mapping types
export interface CountryNames {
    [key: string]: string[];
}

export interface CountryLanguages {
    [key: string]: string[];
}


export interface EnrichmentField {
    name: string;
    type: string;
    description: string;
    id: number;
    enumValues?: string[];
}

export interface Enrichment {
    modelName: string;
    prompt: string;
    fields: EnrichmentField[];
    selectedMetadataFields: string[];
    selectedModel: string;
    bestOf?: number;
}