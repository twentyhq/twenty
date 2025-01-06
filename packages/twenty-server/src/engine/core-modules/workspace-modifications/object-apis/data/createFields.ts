// Helper functions to create different field types

import * as objectFieldTypes from "../types/types";

export class CreateFieldsOnObject {

    createTextField(params: Omit<objectFieldTypes.TextField, 'type'>): objectFieldTypes.TextField {
        return {
            ...params,
            type: 'TEXT'
        };
    }
    
    createNumberField(params: Omit<objectFieldTypes.NumberField, 'type'>): objectFieldTypes.NumberField {
        return {
            ...params,
            type: 'NUMBER'
        };
    }
    
    createBooleanField(params: Omit<objectFieldTypes.BooleanField, 'type'>): objectFieldTypes.BooleanField {
        return {
            ...params,
            type: 'BOOLEAN'
        };
    }
    
    createDateTimeField(params: Omit<objectFieldTypes.DateTimeField, 'type'>): objectFieldTypes.DateTimeField {
        return {
            ...params,
            type: 'DATE_TIME'
        };
    }
    
    createSelectField(params: Omit<objectFieldTypes.SelectField, 'type'>): objectFieldTypes.SelectField {
        return {
            ...params,
            type: 'SELECT'
        };
    }
    
    createLinkField(params: Omit<objectFieldTypes.LinkField, 'type'>): objectFieldTypes.LinkField {
        return {
            ...params,
            type: 'LINKS'
        };
    }
    
    createRawJsonField(params: Omit<objectFieldTypes.RawJsonField, 'type'>): objectFieldTypes.RawJsonField {
        return {
            ...params,
            type: 'RAW_JSON'
        };
    }
    
}