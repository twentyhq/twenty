// @ts-nocheck
import {
    GraphQLSchema,
    isEnumType,
    isInterfaceType,
    isObjectType,
    isScalarType,
    isUnionType,
    GraphQLScalarType,
    GraphQLType,
    GraphQLObjectType,
} from 'graphql'
import { excludedTypes } from '../common/excludedTypes'
import { RenderContext } from '../common/RenderContext'
import { enumType } from './enumType'
import { objectType } from './objectType'
import { renderScalarTypes } from './scalarType'
import { unionType } from './unionType'
import { interfaceType } from './interfaceType'
import { sortKeys } from '../common/support'

export const renderResponseTypes = (
    schema: GraphQLSchema,
    ctx: RenderContext,
) => {
    let typeMap = schema.getTypeMap()
    if (ctx.config?.sortProperties) {
        typeMap = sortKeys(typeMap)
    }
    ctx.addCodeBlock(
        renderScalarTypes(
            ctx,
            Object.values(typeMap).filter((type): type is GraphQLScalarType =>
                isScalarType(type),
            ),
        ),
    )
    for (const name in typeMap) {
        if (excludedTypes.includes(name)) continue

        const type = typeMap[name]

        if (isEnumType(type)) enumType(type, ctx)
        if (isUnionType(type)) unionType(type, ctx)
        if (isObjectType(type)) objectType(type, ctx)
        if (isInterfaceType(type)) interfaceType(type, ctx)
    }

    const aliases = [
        { type: schema.getQueryType(), name: 'Query' },
        { type: schema.getMutationType(), name: 'Mutation' },
        { type: schema.getSubscriptionType(), name: 'Subscription' },
    ]
        .map(renderAlias)
        .filter(Boolean)
        .join('\n')
    ctx.addCodeBlock(aliases)
}

function renderAlias({
    type,
    name,
}: {
    type?: GraphQLObjectType | null
    name: string
}) {
    if (type && type.name !== name) {
        return `export type ${name} = ${type.name}`
    }
    return ''
}
