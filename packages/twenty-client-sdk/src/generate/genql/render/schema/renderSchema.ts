// @ts-nocheck
import { GraphQLSchema, printSchema } from 'graphql'
import { RenderContext } from '../common/RenderContext'

export const renderSchema = (schema: GraphQLSchema, ctx: RenderContext) => {
    ctx.addCodeBlock(printSchema(schema))
}
