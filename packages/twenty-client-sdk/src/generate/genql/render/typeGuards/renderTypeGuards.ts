// @ts-nocheck
import {
    GraphQLSchema,
    isInterfaceType,
    isObjectType,
    isUnionType,
} from 'graphql'
import { excludedTypes } from '../common/excludedTypes'
import { RenderContext } from '../common/RenderContext'

const renderTypeGuard = (target: string, possible: string[]) => {
    return `
    const ${target}_possibleTypes: string[] = [${possible
        .map((t) => `'${t}'`)
        .join(',')}]
    export const is${target} = (obj?: { __typename?: any } | null): obj is ${target} => {
      if (!obj?.__typename) throw new Error('__typename is missing in "is${target}"')
      return ${target}_possibleTypes.includes(obj.__typename)
    }
    `
}

export const renderTypeGuards = (schema: GraphQLSchema, ctx: RenderContext) => {
    const typeMap = schema.getTypeMap()
    for (const name in typeMap) {
        if (excludedTypes.includes(name)) continue

        const type = typeMap[name]

        if (isUnionType(type)) {
            const types = type.getTypes().map((t) => t.name)
            ctx.addCodeBlock(renderTypeGuard(type.name, types))
        } else if (isInterfaceType(type)) {
            const types = schema.getPossibleTypes(type).map((t) => t.name)
            ctx.addCodeBlock(renderTypeGuard(type.name, types))
        } else if (isObjectType(type)) {
            ctx.addCodeBlock(renderTypeGuard(type.name, [type.name]))
        }
    }
}
