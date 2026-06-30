// @ts-nocheck
import { GraphQLEnumType, GraphQLScalarType } from 'graphql'
import { RenderContext } from '../common/RenderContext'
import { Type } from '../../runtime/types'

export const scalarType = (
    type: GraphQLScalarType | GraphQLEnumType,
    _: RenderContext,
): Type<string> => ({})
