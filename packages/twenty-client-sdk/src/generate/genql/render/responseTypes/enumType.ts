// @ts-nocheck
import { GraphQLEnumType } from 'graphql'
import { typeComment } from '../common/comment'
import { RenderContext } from '../common/RenderContext'

export const enumType = (type: GraphQLEnumType, ctx: RenderContext) => {
  const values = type.getValues().map(v => `'${v.name}'`)
  ctx.addCodeBlock(`${typeComment(type)}export type ${type.name} = ${values.join(' | ')}`)
}
