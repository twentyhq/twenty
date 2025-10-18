// @ts-nocheck
import type {
    CompressedType,
    CompressedTypeMap,
    LinkedArgMap,
    LinkedField,
    LinkedType,
    LinkedTypeMap,
} from './types'

export interface PartialLinkedFieldMap {
    [field: string]: {
        type: string
        args?: LinkedArgMap
    }
}

export const linkTypeMap = (
    typeMap: CompressedTypeMap<number>,
): LinkedTypeMap => {
    const indexToName: Record<number, string> = Object.assign(
        {},
        ...Object.keys(typeMap.types).map((k, i) => ({ [i]: k })),
    )

    let intermediaryTypeMap = Object.assign(
        {},
        ...Object.keys(typeMap.types || {}).map(
            (k): Record<string, LinkedType> => {
                const type: CompressedType = typeMap.types[k]!
                const fields = type || {}
                return {
                    [k]: {
                        name: k,
                        // type scalar properties
                        scalar: Object.keys(fields).filter((f) => {
                            const [type] = fields[f] || []

                            const isScalar =
                                type && typeMap.scalars.includes(type)
                            if (!isScalar) {
                                return false
                            }
                            const args = fields[f]?.[1]
                            const argTypes = Object.values(args || {})
                                .map((x) => x?.[1])
                                .filter(Boolean)

                            const hasRequiredArgs = argTypes.some(
                                (str) => str && str.endsWith('!'),
                            )
                            if (hasRequiredArgs) {
                                return false
                            }
                            return true
                        }),
                        // fields with corresponding `type` and `args`
                        fields: Object.assign(
                            {},
                            ...Object.keys(fields).map(
                                (f): PartialLinkedFieldMap => {
                                    const [typeIndex, args] = fields[f] || []
                                    if (typeIndex == null) {
                                        return {}
                                    }
                                    return {
                                        [f]: {
                                            // replace index with type name
                                            type: indexToName[typeIndex],
                                            args: Object.assign(
                                                {},
                                                ...Object.keys(args || {}).map(
                                                    (k) => {
                                                        // if argTypeString == argTypeName, argTypeString is missing, need to readd it
                                                        if (!args || !args[k]) {
                                                            return
                                                        }
                                                        const [
                                                            argTypeName,
                                                            argTypeString,
                                                        ] = args[k] as any
                                                        return {
                                                            [k]: [
                                                                indexToName[
                                                                    argTypeName
                                                                ],
                                                                argTypeString ||
                                                                    indexToName[
                                                                        argTypeName
                                                                    ],
                                                            ],
                                                        }
                                                    },
                                                ),
                                            ),
                                        },
                                    }
                                },
                            ),
                        ),
                    },
                }
            },
        ),
    )
    const res = resolveConcreteTypes(intermediaryTypeMap)
    return res
}

// replace typename with concrete type
export const resolveConcreteTypes = (linkedTypeMap: LinkedTypeMap) => {
    Object.keys(linkedTypeMap).forEach((typeNameFromKey) => {
        const type: LinkedType = linkedTypeMap[typeNameFromKey]!
        // type.name = typeNameFromKey
        if (!type.fields) {
            return
        }

        const fields = type.fields

        Object.keys(fields).forEach((f) => {
            const field: LinkedField = fields[f]!

            if (field.args) {
                const args = field.args
                Object.keys(args).forEach((key) => {
                    const arg = args[key]

                    if (arg) {
                        const [typeName] = arg

                        if (typeof typeName === 'string') {
                            if (!linkedTypeMap[typeName]) {
                                linkedTypeMap[typeName] = { name: typeName }
                            }

                            arg[0] = linkedTypeMap[typeName]!
                        }
                    }
                })
            }

            const typeName = field.type as LinkedType | string

            if (typeof typeName === 'string') {
                if (!linkedTypeMap[typeName]) {
                    linkedTypeMap[typeName] = { name: typeName }
                }

                field.type = linkedTypeMap[typeName]!
            }
        })
    })

    return linkedTypeMap
}
