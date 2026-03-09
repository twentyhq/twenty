// @ts-nocheck

export interface ExecutionResult<TData = { [key: string]: any }> {
    errors?: Array<Error>
    data?: TData | null
}

export interface ArgMap<keyType = number> {
    [arg: string]: [keyType, string] | [keyType] | undefined
}

export type CompressedField<keyType = number> = [
    type: keyType,
    args?: ArgMap<keyType>,
]

export interface CompressedFieldMap<keyType = number> {
    [field: string]: CompressedField<keyType> | undefined
}

export type CompressedType<keyType = number> = CompressedFieldMap<keyType>

export interface CompressedTypeMap<keyType = number> {
    scalars: Array<keyType>
    types: {
        [type: string]: CompressedType<keyType> | undefined
    }
}

// normal types
export type Field<keyType = number> = {
    type: keyType
    args?: ArgMap<keyType>
}

export interface FieldMap<keyType = number> {
    [field: string]: Field<keyType> | undefined
}

export type Type<keyType = number> = FieldMap<keyType>

export interface TypeMap<keyType = number> {
    scalars: Array<keyType>
    types: {
        [type: string]: Type<keyType> | undefined
    }
}

export interface LinkedArgMap {
    [arg: string]: [LinkedType, string] | undefined
}
export interface LinkedField {
    type: LinkedType
    args?: LinkedArgMap
}

export interface LinkedFieldMap {
    [field: string]: LinkedField | undefined
}

export interface LinkedType {
    name: string
    fields?: LinkedFieldMap
    scalar?: string[]
}

export interface LinkedTypeMap {
    [type: string]: LinkedType | undefined
}
