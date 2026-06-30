// @ts-nocheck
import { GraphQLNamedType } from 'graphql'

export const requestTypeName = (type?: GraphQLNamedType) => {
    if (!type) return ''
    return `${type.name}GenqlSelection`
}
