// @ts-nocheck
import {
    ArgMap,
    CompressedField,
    CompressedFieldMap,
    CompressedTypeMap,
    TypeMap,
} from '../../runtime/types'
import {
    GraphQLSchema,
    isEnumType,
    isInputObjectType,
    isInterfaceType,
    isObjectType,
    isScalarType,
    isUnionType,
} from 'graphql'
import { excludedTypes } from '../common/excludedTypes'
import { RenderContext } from '../common/RenderContext'
import { objectType } from './objectType'
import { unionType } from './unionType'

export const renderTypeMap = (schema: GraphQLSchema, ctx: RenderContext) => {
    // remove fields key,
    // remove the Type.type and Type.args, replace with [type, args]
    // reverse args.{name}
    // Args type is deduced and added only when the concrete type is different from type name, remove the scalar field and replace with a top level scalars array field.
    const result: TypeMap<string> = {
        scalars: [],
        types: {},
    }

    Object.keys(schema.getTypeMap())
        .filter((t) => !excludedTypes.includes(t))
        .map((t) => schema.getTypeMap()[t])
        .map((t) => {
            if (isObjectType(t) || isInterfaceType(t) || isInputObjectType(t))
                result.types[t.name] = objectType(t, ctx)
            else if (isUnionType(t)) result.types[t.name] = unionType(t, ctx)
            else if (isScalarType(t) || isEnumType(t)) {
                result.scalars.push(t.name)
                result.types[t.name] = {}
            }
        })

    // change names of query, mutation on schemas that chose different names (hasura)
    const q = schema.getQueryType()
    if (q?.name && q?.name !== 'Query') {
        delete result.types[q.name]
        result.types.Query = objectType(q, ctx)
        // result.Query.name = 'Query'
    }

    const m = schema.getMutationType()
    if (m?.name && m.name !== 'Mutation') {
        delete result.types[m.name]
        result.types.Mutation = objectType(m, ctx)
        // result.Mutation.name = 'Mutation'
    }

    const s = schema.getSubscriptionType()
    if (s?.name && s.name !== 'Subscription') {
        delete result.types[s.name]
        result.types.Subscription = objectType(s, ctx)
        // result.Subscription.name = 'Subscription'
    }

    ctx.addCodeBlock(
        JSON.stringify(replaceTypeNamesWithIndexes(result), null, 4),
    )
    


}

export function replaceTypeNamesWithIndexes(
    typeMap: TypeMap<string>,
): CompressedTypeMap<number> {
    const nameToIndex: Record<string, number> = Object.assign(
        {},
        ...Object.keys(typeMap.types).map((k, i) => ({ [k]: i })),
    )
    const scalars = typeMap.scalars.map((x) => nameToIndex[x])
    const types = Object.assign(
        {},
        ...Object.keys(typeMap.types || {}).map((k) => {
            const type = typeMap.types[k]
            const fieldsMap = type || {}
            // processFields(fields, indexToName)
            const fields = Object.assign(
                {},
                ...Object.keys(fieldsMap).map(
                    (f): CompressedFieldMap<number> => {
                        const content = fieldsMap[f] as any
                        if (!content) {
                            throw new Error('no content in field ' + f)
                        }
                        const [typeName, args] = [content.type, content.args]
                        const res: CompressedField<number> = [
                            typeName ? nameToIndex[typeName] : -1,
                        ]
                        if (args) {
                            res[1] = Object.assign(
                                {},
                                ...Object.keys(args || {}).map((k) => {
                                    const arg = args?.[k]
                                    if (!arg) {
                                        throw new Error(
                                            'replaceTypeNamesWithIndexes: no arg for ' +
                                                k,
                                        )
                                    }
                                    return {
                                        [k]: [
                                            nameToIndex[arg[0]],
                                            ...arg.slice(1),
                                        ],
                                    } as ArgMap<number>
                                }),
                            )
                        }

                        return {
                            [f]: res,
                        }
                    },
                ),
            )
            return {
                [k]: {
                    ...fields,
                },
            }
        }),
    )
    return {
        scalars,
        types,
    }
}
